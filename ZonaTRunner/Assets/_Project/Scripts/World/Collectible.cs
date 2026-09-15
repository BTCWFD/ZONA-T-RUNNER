using UnityEngine;
using ZonaTRunner.Core;

namespace ZonaTRunner.World
{
    public class Collectible : MonoBehaviour
    {
        [SerializeField] private int coinValue = 1;
        [SerializeField] private float rotationSpeed = 180f;
        [SerializeField] private float bobAmplitude = 0.3f;
        [SerializeField] private float bobFrequency = 2f;

        private Vector3 startPos;

        private void Start()
        {
            startPos = transform.position;
        }

        private void Update()
        {
            // Rotate and bob
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
            Vector3 pos = startPos;
            pos.y += Mathf.Sin(Time.time * bobFrequency) * bobAmplitude;
            transform.position = pos;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                GameManager.Instance?.AddCoins(coinValue);
                gameObject.SetActive(false);
            }
        }
    }
}
