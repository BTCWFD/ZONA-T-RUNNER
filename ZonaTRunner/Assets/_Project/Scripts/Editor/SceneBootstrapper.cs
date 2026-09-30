using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;

namespace ZonaTRunner.Editor
{
    public class SceneBootstrapper : EditorWindow
    {
        [MenuItem("ZONA T RUNNER/Crear Escena Principal", false, 1)]
        static void CreateMainScene()
        {
            // Create a new empty scene
            Scene newScene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            // --- CAMERA ---
            GameObject camObj = new GameObject("Main Camera");
            Camera cam = camObj.AddComponent<Camera>();
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.03f, 0.02f, 0.05f);
            cam.fieldOfView = 65f;
            cam.nearClipPlane = 0.1f;
            cam.farClipPlane = 200f;
            camObj.transform.position = new Vector3(0, 4.5f, -6.5f);
            camObj.transform.rotation = Quaternion.Euler(15f, 0f, 0f);
            camObj.tag = "MainCamera";
            camObj.AddComponent<AudioListener>();
            camObj.AddComponent<ZonaTRunner.World.CameraFollow>();

            // --- DIRECTIONAL LIGHT ---
            GameObject lightObj = new GameObject("Directional Light");
            Light light = lightObj.AddComponent<Light>();
            light.type = LightType.Directional;
            light.color = new Color(0.85f, 0.85f, 1f);
            light.intensity = 0.9f;
            lightObj.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            // --- GAME MANAGER ---
            GameObject gmObj = new GameObject("[GameManager]");
            gmObj.AddComponent<ZonaTRunner.Core.GameManager>();

            // --- INPUT HANDLER ---
            GameObject inputObj = new GameObject("[InputHandler]");
            inputObj.AddComponent<ZonaTRunner.Player.SwipeInputHandler>();

            // --- BEAT SYNCHRONIZER ---
            GameObject beatObj = new GameObject("[BeatSync]");
            AudioSource beatAudio = beatObj.AddComponent<AudioSource>();
            beatAudio.playOnAwake = false;
            beatObj.AddComponent<ZonaTRunner.Audio.BeatSynchronizer>();

            // --- PLAYER ---
            GameObject playerObj = new GameObject("Player");
            playerObj.tag = "Player";

            // Character Controller
            CharacterController cc = playerObj.AddComponent<CharacterController>();
            cc.height = 1.8f;
            cc.radius = 0.4f;
            cc.center = new Vector3(0, 0.9f, 0);

            // Player Controller Script
            playerObj.AddComponent<ZonaTRunner.Player.PlayerController>();

            // Player Visual: Body
            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cube);
            body.name = "Body";
            body.transform.SetParent(playerObj.transform);
            body.transform.localPosition = new Vector3(0, 0.9f, 0);
            body.transform.localScale = new Vector3(0.9f, 1.4f, 0.5f);
            var bodyRenderer = body.GetComponent<Renderer>();
            bodyRenderer.material = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            bodyRenderer.material.color = new Color(1f, 0f, 0.33f); // DJ FRESAR magenta
            Object.DestroyImmediate(body.GetComponent<BoxCollider>()); // CC handles collision

            // Player Visual: Head
            GameObject head = GameObject.CreatePrimitive(PrimitiveType.Cube);
            head.name = "Head";
            head.transform.SetParent(body.transform);
            head.transform.localPosition = new Vector3(0, 0.7f, 0);
            head.transform.localScale = new Vector3(0.6f, 0.45f, 1f);
            var headRenderer = head.GetComponent<Renderer>();
            headRenderer.material = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            headRenderer.material.color = new Color(0.12f, 0.12f, 0.16f);
            Object.DestroyImmediate(head.GetComponent<BoxCollider>());

            // Player Visual: Visor (Glowing)
            GameObject visor = GameObject.CreatePrimitive(PrimitiveType.Cube);
            visor.name = "Visor";
            visor.transform.SetParent(head.transform);
            visor.transform.localPosition = new Vector3(0, 0.05f, 0.52f);
            visor.transform.localScale = new Vector3(0.8f, 0.35f, 0.15f);
            var visorRenderer = visor.GetComponent<Renderer>();
            visorRenderer.material = new Material(Shader.Find("Universal Render Pipeline/Unlit"));
            visorRenderer.material.color = new Color(0, 1f, 1f); // Cyan glow
            Object.DestroyImmediate(visor.GetComponent<BoxCollider>());

            playerObj.transform.position = Vector3.zero;

            // --- TRACK SPAWNER ---
            GameObject trackObj = new GameObject("[TrackSpawner]");
            trackObj.AddComponent<ZonaTRunner.World.TrackSpawner>();

            // --- GROUND PLANE (Initial visual) ---
            GameObject groundObj = GameObject.CreatePrimitive(PrimitiveType.Plane);
            groundObj.name = "Ground_Visual";
            groundObj.transform.position = new Vector3(0, -0.01f, 50f);
            groundObj.transform.localScale = new Vector3(1.2f, 1f, 20f);
            var groundRenderer = groundObj.GetComponent<Renderer>();
            groundRenderer.material = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            groundRenderer.material.color = new Color(0.06f, 0.03f, 0.09f);

            // --- LANE MARKERS ---
            CreateLaneMarker("LaneMarker_Left", -1.6f);
            CreateLaneMarker("LaneMarker_Right", 1.6f);

            // --- SAMPLE OBSTACLE (low, to jump over) ---
            GameObject obstacle = GameObject.CreatePrimitive(PrimitiveType.Cube);
            obstacle.name = "Obstacle_Low_Sample";
            obstacle.tag = "Obstacle";
            obstacle.transform.position = new Vector3(0, 0.4f, 25f);
            obstacle.transform.localScale = new Vector3(2.4f, 0.8f, 1f);
            var obsRenderer = obstacle.GetComponent<Renderer>();
            obsRenderer.material = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            obsRenderer.material.color = new Color(0.85f, 0.1f, 0f);

            // Save the scene
            string scenePath = "Assets/_Project/Scenes/ZonaTRunner_Main.unity";
            EditorSceneManager.SaveScene(newScene, scenePath);

            Debug.Log("✅ ZONA T RUNNER — Escena principal creada exitosamente en: " + scenePath);
            Debug.Log("🎮 Pulsa PLAY para probar el movimiento del corredor (A/D moverse, W/Space saltar, S deslizarse)");

            // Select the Player to show it in Inspector
            Selection.activeGameObject = playerObj;
        }

        static void CreateLaneMarker(string name, float xPos)
        {
            GameObject marker = GameObject.CreatePrimitive(PrimitiveType.Cube);
            marker.name = name;
            marker.transform.position = new Vector3(xPos, 0.01f, 50f);
            marker.transform.localScale = new Vector3(0.15f, 0.02f, 200f);
            var renderer = marker.GetComponent<Renderer>();
            renderer.material = new Material(Shader.Find("Universal Render Pipeline/Unlit"));
            renderer.material.color = new Color(1f, 0f, 0.33f, 0.8f); // Neon magenta lane lines
            Object.DestroyImmediate(marker.GetComponent<BoxCollider>());
        }

        [MenuItem("ZONA T RUNNER/Crear Tag Obstacle", false, 20)]
        static void EnsureObstacleTag()
        {
            // Open Tag Manager
            SerializedObject tagManager = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
            SerializedProperty tagsProp = tagManager.FindProperty("tags");

            bool found = false;
            for (int i = 0; i < tagsProp.arraySize; i++)
            {
                if (tagsProp.GetArrayElementAtIndex(i).stringValue == "Obstacle")
                {
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                tagsProp.InsertArrayElementAtIndex(tagsProp.arraySize);
                tagsProp.GetArrayElementAtIndex(tagsProp.arraySize - 1).stringValue = "Obstacle";
                tagManager.ApplyModifiedProperties();
                Debug.Log("✅ Tag 'Obstacle' creado exitosamente");
            }
            else
            {
                Debug.Log("ℹ️ Tag 'Obstacle' ya existe");
            }
        }
    }
}
