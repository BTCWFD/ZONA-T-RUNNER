using UnityEngine;
using UnityEditor;

/// <summary>
/// Creates a Placeholder Prefab for LETAL character.
/// Run from menu: ZonaTRunner > Create Placeholder LETAL Prefab
/// </summary>
public class LetalPrefabSetup
{
    [MenuItem("ZonaTRunner/Create Placeholder LETAL Prefab")]
    public static void CreatePlaceholderPrefab()
    {
        string prefabPath = "Assets/_Project/Characters/LETAL/Prefabs/LETAL_Character.prefab";

        // Create base object
        GameObject root = new GameObject("LETAL_Character");
        
        // Add Animator
        Animator anim = root.AddComponent<Animator>();
        RuntimeAnimatorController controller = AssetDatabase.LoadAssetAtPath<RuntimeAnimatorController>("Assets/_Project/Characters/LETAL/LETAL_AnimatorController.controller");
        if (controller != null) anim.runtimeAnimatorController = controller;

        // Create body parts (Placeholder)
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "Body (Latex)";
        body.transform.SetParent(root.transform);
        body.transform.localPosition = new Vector3(0, 1f, 0);
        
        GameObject ears = GameObject.CreatePrimitive(PrimitiveType.Cube);
        ears.name = "CatEars";
        ears.transform.SetParent(root.transform);
        ears.transform.localPosition = new Vector3(0, 2.1f, 0);
        ears.transform.localScale = new Vector3(0.6f, 0.2f, 0.2f);

        GameObject violin = GameObject.CreatePrimitive(PrimitiveType.Cube);
        violin.name = "NeonViolin";
        violin.transform.SetParent(root.transform);
        violin.transform.localPosition = new Vector3(0.6f, 1f, 0.5f);
        violin.transform.localScale = new Vector3(0.2f, 0.8f, 0.1f);
        violin.transform.localRotation = Quaternion.Euler(45, 0, 0);

        // Assign materials
        Material latexMat = AssetDatabase.LoadAssetAtPath<Material>("Assets/_Project/Characters/LETAL/Materials/MAT_LETAL_Latex.mat");
        Material earsMat = AssetDatabase.LoadAssetAtPath<Material>("Assets/_Project/Characters/LETAL/Materials/MAT_CatEars.mat");
        Material violinMat = AssetDatabase.LoadAssetAtPath<Material>("Assets/_Project/Characters/LETAL/Materials/MAT_Violin_Neon.mat");

        if (latexMat != null) body.GetComponent<MeshRenderer>().sharedMaterial = latexMat;
        if (earsMat != null) ears.GetComponent<MeshRenderer>().sharedMaterial = earsMat;
        if (violinMat != null) violin.GetComponent<MeshRenderer>().sharedMaterial = violinMat;

        // Clean up colliders
        Object.DestroyImmediate(body.GetComponent<Collider>());
        Object.DestroyImmediate(ears.GetComponent<Collider>());
        Object.DestroyImmediate(violin.GetComponent<Collider>());

        // Save prefab
        PrefabUtility.SaveAsPrefabAsset(root, prefabPath);
        Object.DestroyImmediate(root);

        Debug.Log($"[LETAL] Placeholder Prefab created at: {prefabPath}");
    }
}
