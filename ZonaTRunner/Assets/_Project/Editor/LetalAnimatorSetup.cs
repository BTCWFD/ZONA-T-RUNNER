using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;

/// <summary>
/// Creates an Animator Controller for LETAL with states:
/// Idle, Run, Jump, Slide — connected with transitions.
/// Run from menu: ZonaTRunner > Create LETAL Animator
/// </summary>
public class LetalAnimatorSetup
{
    private const string CHAR_PATH  = "Assets/_Project/Characters/LETAL";
    private const string ANIM_PATH  = "Assets/_Project/Characters/LETAL/Animations";

    [MenuItem("ZonaTRunner/Create LETAL Animator")]
    public static void CreateAnimator()
    {
        string controllerPath = $"{CHAR_PATH}/LETAL_AnimatorController.controller";

        var controller = AnimatorController.CreateAnimatorControllerAtPath(controllerPath);

        // Add parameters used by PlayerController
        controller.AddParameter("Speed", AnimatorControllerParameterType.Float);
        controller.AddParameter("IsGrounded", AnimatorControllerParameterType.Bool);
        controller.AddParameter("IsSliding", AnimatorControllerParameterType.Bool);
        controller.AddParameter("Jump", AnimatorControllerParameterType.Trigger);

        // Get the base layer state machine
        var rootSM = controller.layers[0].stateMachine;

        // --- Create states (clip will be assigned when FBX is imported) ---
        var idleState = rootSM.AddState("Idle", new Vector3(200, 0, 0));
        var runState  = rootSM.AddState("Run",  new Vector3(200, 80, 0));
        var jumpState = rootSM.AddState("Jump", new Vector3(400, 0, 0));
        var slideState = rootSM.AddState("Slide", new Vector3(400, 80, 0));

        // Set default
        rootSM.defaultState = idleState;

        // --- Transitions ---

        // Idle -> Run: when Speed > 0.1
        var idleToRun = idleState.AddTransition(runState);
        idleToRun.AddCondition(AnimatorConditionMode.Greater, 0.1f, "Speed");
        idleToRun.hasExitTime = false;
        idleToRun.duration = 0.15f;

        // Run -> Idle: when Speed < 0.1
        var runToIdle = runState.AddTransition(idleState);
        runToIdle.AddCondition(AnimatorConditionMode.Less, 0.1f, "Speed");
        runToIdle.hasExitTime = false;
        runToIdle.duration = 0.15f;

        // Run -> Jump: trigger Jump
        var runToJump = runState.AddTransition(jumpState);
        runToJump.AddCondition(AnimatorConditionMode.If, 0, "Jump");
        runToJump.hasExitTime = false;
        runToJump.duration = 0.1f;

        // Jump -> Run: when IsGrounded = true
        var jumpToRun = jumpState.AddTransition(runState);
        jumpToRun.AddCondition(AnimatorConditionMode.If, 0, "IsGrounded");
        jumpToRun.hasExitTime = false;
        jumpToRun.duration = 0.15f;

        // Run -> Slide: IsSliding = true
        var runToSlide = runState.AddTransition(slideState);
        runToSlide.AddCondition(AnimatorConditionMode.If, 0, "IsSliding");
        runToSlide.hasExitTime = false;
        runToSlide.duration = 0.1f;

        // Slide -> Run: IsSliding = false
        var slideToRun = slideState.AddTransition(runState);
        slideToRun.AddCondition(AnimatorConditionMode.IfNot, 0, "IsSliding");
        slideToRun.hasExitTime = false;
        slideToRun.duration = 0.15f;

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[LETAL] Animator Controller created with 4 states: Idle, Run, Jump, Slide");
    }
}
