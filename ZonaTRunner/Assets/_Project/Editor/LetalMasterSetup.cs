using UnityEditor;

public class LetalMasterSetup
{
    [MenuItem("ZonaTRunner/Run Master Setup")]
    public static void RunAll()
    {
        LetalAnimatorSetup.CreateAnimator();
        LetalPrefabSetup.CreatePlaceholderPrefab();
        LetalSceneSetup.CreateTestScene();
        UnityEngine.Debug.Log("[LETAL] Master Setup Complete!");
    }
}
