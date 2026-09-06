using UnityEngine;
using UnityEditor;
using ZonaTRunner.Player;

/// <summary>
/// Upgrades the Placeholder Prefab with gameplay components.
/// Run from menu: ZonaTRunner > Upgrade LETAL For Gameplay
/// </summary>
public class LetalGameplaySetup
{
    [MenuItem("ZonaTRunner/Upgrade LETAL For Gameplay")]
    public static void UpgradePrefab()
    {
        string prefabPath = "Assets/_Project/Characters/LETAL/Prefabs/LETAL_Character.prefab";
        
        using (var editingScope = new PrefabUtility.EditPrefabContentsScope(prefabPath))
        {
            var root = editingScope.prefabContentsRoot;
            
            // Add CharacterController
            var cc = root.GetComponent<CharacterController>();
            if (cc == null) cc = root.AddComponent<CharacterController>();
            cc.center = new Vector3(0, 1f, 0);
            cc.height = 2f;
            cc.radius = 0.3f;
            
            // Add PlayerController
            var pc = root.GetComponent<PlayerController>();
            if (pc == null) pc = root.AddComponent<PlayerController>();
            
            // Link Animator to PlayerController
            var anim = root.GetComponent<Animator>();
            
            // Expose private field using SerializedObject
            SerializedObject serializedPC = new SerializedObject(pc);
            SerializedProperty animProp = serializedPC.FindProperty("animator");
            if (animProp != null)
            {
                animProp.objectReferenceValue = anim;
                serializedPC.ApplyModifiedProperties();
            }
            
            Debug.Log("[LETAL] Upgraded Prefab with CharacterController & PlayerController!");
        }
    }
}
