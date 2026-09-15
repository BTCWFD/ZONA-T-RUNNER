using System.Collections.Generic;
using UnityEngine;
using ZonaTRunner.Utils;

namespace ZonaTRunner.World
{
    /// <summary>
    /// Genera la pista infinita encadenando segmentos del kit modular
    /// (blender_map/track_kit/, ver docs/TRACK_KIT.md).
    ///
    /// Anclaje: cada segmento tiene su origen en (0,0,0) y ocupa [0, segmentLength]
    /// hacia adelante. Encadenar es sumar segmentLength. En Blender ese eje es +Y;
    /// al importar el .fbx/.glb Unity lo convierte a +Z, asi que aqui se trabaja
    /// en Z y NO hay que rotar nada a mano.
    ///
    /// Todo se recicla por pool: durante el gameplay no se llama a Instantiate ni
    /// a Destroy, que es el requisito de 0 GC allocation por frame de
    /// docs/TECHNICAL_ARCHITECTURE.md.
    /// </summary>
    public class TrackSpawner : MonoBehaviour
    {
        [Header("Kit modular (track_kit)")]
        [Tooltip("Prefabs de segmento. El indice 0 se usa como tramo seguro de arranque.")]
        [SerializeField] private Transform[] trackSegmentPrefabs;

        [Tooltip("Debe coincidir con grid.segmentLength de track_kit_manifest.json.")]
        [SerializeField] private float segmentLength = 40f;

        [Tooltip("Debe coincidir con grid.laneWidth de track_kit_manifest.json.")]
        [SerializeField] private float laneWidth = 2.4f;

        [Header("Streaming")]
        [SerializeField] private Transform playerTransform;
        [SerializeField] private int activeSegments = 6;
        [SerializeField] private int safeStartSegments = 2;
        [SerializeField] private float despawnDistance = 45f;

        /// <summary>Posicion X de cada carril. La usan obstaculos y coleccionables.</summary>
        public float[] LaneOffsets => new[] { -laneWidth, 0f, laneWidth };
        public float SegmentLength => segmentLength;

        private readonly List<ObjectPool<Transform>> pools = new List<ObjectPool<Transform>>();
        private readonly Queue<SpawnedSegment> live = new Queue<SpawnedSegment>();
        private float nextSpawnZ;
        private int lastPrefabIndex = -1;

        private struct SpawnedSegment
        {
            public Transform Instance;
            public int PrefabIndex;
        }

        private void Start()
        {
            if (trackSegmentPrefabs == null || trackSegmentPrefabs.Length == 0)
            {
                Debug.LogError("[ZonaT] TrackSpawner sin prefabs de segmento. " +
                               "Asigna los SEG_* de blender_map/track_kit/.");
                enabled = false;
                return;
            }

            if (playerTransform == null)
            {
                GameObject player = GameObject.FindGameObjectWithTag("Player");
                if (player != null) playerTransform = player.transform;
            }

            // Un pool por prefab. Se preasigna todo aqui, antes de que empiece la partida.
            int perPool = Mathf.Max(2, activeSegments / trackSegmentPrefabs.Length + 1);
            foreach (Transform prefab in trackSegmentPrefabs)
                pools.Add(new ObjectPool<Transform>(prefab, perPool, transform));

            for (int i = 0; i < activeSegments; i++)
                SpawnSegment(isSafeZone: i < safeStartSegments);
        }

        private void Update()
        {
            if (playerTransform == null) return;
            float playerZ = playerTransform.position.z;

            // Mantiene siempre `activeSegments` por delante del jugador.
            while (nextSpawnZ - playerZ < activeSegments * segmentLength)
                SpawnSegment(isSafeZone: false);

            // Devuelve al pool lo que ya quedo atras.
            while (live.Count > 0 && playerZ - live.Peek().Instance.position.z > despawnDistance)
            {
                SpawnedSegment old = live.Dequeue();
                pools[old.PrefabIndex].Return(old.Instance);
            }
        }

        private void SpawnSegment(bool isSafeZone)
        {
            int index = isSafeZone ? 0 : PickVariedIndex();
            Transform seg = pools[index].Get();
            seg.SetPositionAndRotation(new Vector3(0f, 0f, nextSpawnZ), Quaternion.identity);

            live.Enqueue(new SpawnedSegment { Instance = seg, PrefabIndex = index });
            lastPrefabIndex = index;
            nextSpawnZ += segmentLength;
        }

        /// <summary>Evita repetir el mismo segmento dos veces seguidas: la repeticion se nota mucho a velocidad.</summary>
        private int PickVariedIndex()
        {
            if (trackSegmentPrefabs.Length == 1) return 0;
            int index = Random.Range(0, trackSegmentPrefabs.Length);
            if (index == lastPrefabIndex)
                index = (index + 1) % trackSegmentPrefabs.Length;
            return index;
        }

        private void OnDrawGizmosSelected()
        {
            // Visualiza los 3 carriles en la escena para colocar obstaculos a mano.
            Gizmos.color = Color.cyan;
            foreach (float x in new[] { -laneWidth, 0f, laneWidth })
                Gizmos.DrawLine(new Vector3(x, 0.05f, -10f), new Vector3(x, 0.05f, 200f));
        }
    }
}
