using System.Collections;
using UnityEngine;
using ZonaTRunner.Core;

namespace ZonaTRunner.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Lane Settings")]
        [SerializeField] private float laneDistance = 2.5f; // Distance between lanes
        [SerializeField] private float laneChangeSpeed = 15f; // Speed of lane transition
        private int currentLane = 0; // -1 = Left, 0 = Center, 1 = Right
        private float targetX = 0f;

        [Header("Jump & Slide Tuning")]
        [SerializeField] private float jumpForce = 10f;
        [SerializeField] private float gravity = 30f;
        [SerializeField] private float slideDuration = 0.7f;
        [SerializeField] private float slideColliderHeight = 0.9f;

        private CharacterController characterController;
        private Vector3 verticalVelocity = Vector3.zero;
        private bool isGrounded = false;
        private bool isSliding = false;
        private float originalColliderHeight;
        private Vector3 originalColliderCenter;

        [Header("Visual Feedback")]
        [SerializeField] private Animator animator;

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            originalColliderHeight = characterController.height;
            originalColliderCenter = characterController.center;
        }

        private void OnEnable()
        {
            SwipeInputHandler.OnSwipeLeft += MoveLeft;
            SwipeInputHandler.OnSwipeRight += MoveRight;
            SwipeInputHandler.OnSwipeUp += Jump;
            SwipeInputHandler.OnSwipeDown += Slide;
        }

        private void OnDisable()
        {
            SwipeInputHandler.OnSwipeLeft -= MoveLeft;
            SwipeInputHandler.OnSwipeRight -= MoveRight;
            SwipeInputHandler.OnSwipeUp -= Jump;
            SwipeInputHandler.OnSwipeDown -= Slide;
        }

        private void Update()
        {
            if (GameManager.Instance == null || GameManager.Instance.CurrentState != GameState.Running)
                return;

            isGrounded = characterController.isGrounded;

            // Apply continuous forward motion from GameManager run speed
            float forwardSpeed = GameManager.Instance.RunSpeed;
            Vector3 moveDirection = Vector3.forward * forwardSpeed;

            // Lane interpolation
            float currentX = transform.position.x;
            float newX = Mathf.MoveTowards(currentX, targetX, laneChangeSpeed * Time.deltaTime);
            moveDirection.x = (newX - currentX) / Time.deltaTime;

            // Vertical movement (Jump & Gravity)
            if (isGrounded)
            {
                if (verticalVelocity.y < 0)
                {
                    verticalVelocity.y = -2f; // Keep grounded stick
                }
            }
            else
            {
                verticalVelocity.y -= gravity * Time.deltaTime;
            }

            moveDirection.y = verticalVelocity.y;

            // Execute move
            characterController.Move(moveDirection * Time.deltaTime);
        }

        public void MoveLeft()
        {
            if (currentLane > -1)
            {
                currentLane--;
                targetX = currentLane * laneDistance;
                GameEvents.TriggerLaneChanged(currentLane);
            }
        }

        public void MoveRight()
        {
            if (currentLane < 1)
            {
                currentLane++;
                targetX = currentLane * laneDistance;
                GameEvents.TriggerLaneChanged(currentLane);
            }
        }

        public void Jump()
        {
            if (isGrounded && !isSliding)
            {
                verticalVelocity.y = jumpForce;
                GameEvents.TriggerPlayerJumped();

                if (animator != null)
                {
                    animator.SetTrigger("Jump");
                }
            }
        }

        public void Slide()
        {
            if (!isSliding)
            {
                StartCoroutine(SlideCoroutine());
            }
            else if (!isGrounded)
            {
                // Quick dive if sliding in mid-air
                verticalVelocity.y = -jumpForce * 1.5f;
            }
        }

        private IEnumerator SlideCoroutine()
        {
            isSliding = true;
            GameEvents.TriggerPlayerSlid();

            // Adjust hitbox for slide
            characterController.height = slideColliderHeight;
            characterController.center = new Vector3(originalColliderCenter.x, slideColliderHeight / 2f, originalColliderCenter.z);

            if (animator != null)
            {
                animator.SetBool("IsSliding", true);
            }

            yield return new WaitForSeconds(slideDuration);

            // Revert hitbox
            characterController.height = originalColliderHeight;
            characterController.center = originalColliderCenter;

            if (animator != null)
            {
                animator.SetBool("IsSliding", false);
            }

            isSliding = false;
        }

        private void OnControllerColliderHit(ControllerColliderHit hit)
        {
            if (hit.gameObject.CompareTag("Obstacle"))
            {
                GameEvents.TriggerPlayerHitObstacle();
                GameManager.Instance.EndRun();
            }
        }
    }
}
