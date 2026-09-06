using UnityEditor;
using UnityEngine;

[InitializeOnLoad]
public static class ForceFocusAndRefresh
{
    static ForceFocusAndRefresh()
    {
        EditorApplication.delayCall += () =>
        {
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        };
    }
}
