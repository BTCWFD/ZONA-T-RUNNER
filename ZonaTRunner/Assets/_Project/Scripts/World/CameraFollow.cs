using UnityEngine;
using ZonaTRunner.Core;

namespace ZonaTRunner.World
{
    public class CameraFollow : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform player;

        [Header("Camera Offset")]
        [SerializeField] private Vector3 offset = new Vector3(0f, 4.5f, -6.5f);
        [SerializeField] private float smoothSpeed = 8f;
        [SerializeField] private float horizontalDamping = 0.4f;

        private void Start()
        {
            if (player == null)
            {
                GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
                if (playerObj != null) player = playerObj.transform;
            }
        }

        private void LateUpdate()
        {
            if (player == null) return;
            if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Running)
                return;

            Vector3 targetPos = player.position + offset;
            targetPos.x = player.position.x * horizontalDamping;

            transform.position = Vector3.Lerp(transform.position, targetPos, smoothSpeed * Time.deltaTime);
        }
    }
}
