using UnityEditor;
using UnityEngine;

namespace ZonaTRunner.Editor
{
    /// <summary>
    /// Valida que la escena principal esté configurada correctamente
    /// y la pone en modo Running listo para Play.
    /// Ejecutar desde: ZONA T RUNNER > Validar y Preparar para Play
    /// </summary>
    public class SceneValidator : EditorWindow
    {
        [MenuItem("ZONA T RUNNER/▶ Validar y Preparar para Play", false, 2)]
        static void ValidateAndPrepare()
        {
            bool allGood = true;
            System.Text.StringBuilder report = new System.Text.StringBuilder();
            report.AppendLine("=== ZONA T RUNNER — Reporte de Validación ===\n");

            // 1. Verificar GameManager
            var gm = Object.FindFirstObjectByType<ZonaTRunner.Core.GameManager>();
            if (gm == null)
            {
                report.AppendLine("❌ GameManager NO encontrado en la escena.");
                allGood = false;
            }
            else
            {
                // Forzar estado Running via reflection para no romper encapsulación
                var field = typeof(ZonaTRunner.Core.GameManager)
                    .GetField("currentState",
                        System.Reflection.BindingFlags.NonPublic |
                        System.Reflection.BindingFlags.Instance);
                if (field != null)
                {
                    field.SetValue(gm, ZonaTRunner.Core.GameState.Running);
                    EditorUtility.SetDirty(gm);
                    report.AppendLine("✅ GameManager encontrado → Estado forzado a Running.");
                }
                else
                {
                    report.AppendLine("✅ GameManager encontrado (estado no modificado).");
                }
            }

            // 2. Verificar Player
            var player = GameObject.FindGameObjectWithTag("Player");
            if (player == null)
            {
                report.AppendLine("❌ Player NO encontrado. Tag 'Player' faltante.");
                allGood = false;
            }
            else
            {
                var cc = player.GetComponent<CharacterController>();
                var pc = player.GetComponent<ZonaTRunner.Player.PlayerController>();
                report.AppendLine($"✅ Player encontrado: '{player.name}'");
                report.AppendLine($"   CharacterController: {(cc != null ? "✅" : "❌ FALTA")}");
                report.AppendLine($"   PlayerController:    {(pc != null ? "✅" : "❌ FALTA")}");
                if (cc == null || pc == null) allGood = false;
            }

            // 3. Verificar Cámara
            var cam = Camera.main;
            if (cam == null)
            {
                report.AppendLine("❌ Main Camera NO encontrada.");
                allGood = false;
            }
            else
            {
                var follow = cam.GetComponent<ZonaTRunner.World.CameraFollow>();
                report.AppendLine($"✅ Main Camera encontrada.");
                report.AppendLine($"   CameraFollow: {(follow != null ? "✅" : "⚠️ No tiene (se añade ahora)")}");
                if (follow == null)
                {
                    cam.gameObject.AddComponent<ZonaTRunner.World.CameraFollow>();
                    EditorUtility.SetDirty(cam.gameObject);
                    report.AppendLine("   → CameraFollow añadido automáticamente.");
                }
            }

            // 4. Verificar TrackSpawner
            var ts = Object.FindFirstObjectByType<ZonaTRunner.World.TrackSpawner>();
            report.AppendLine($"   TrackSpawner: {(ts != null ? "✅" : "❌ FALTA")}");
            if (ts == null) allGood = false;

            // 5. Verificar InputHandler
            var input = Object.FindFirstObjectByType<ZonaTRunner.Player.SwipeInputHandler>();
            report.AppendLine($"   InputHandler: {(input != null ? "✅" : "❌ FALTA")}");
            if (input == null) allGood = false;

            // Resultado final
            report.AppendLine("\n" + (allGood
                ? "🎮 TODO LISTO — Presiona ▶ Play para jugar!"
                : "⚠️ Hay problemas. Ejecuta 'Crear Escena Principal' primero."));

            Debug.Log(report.ToString());

            if (allGood)
            {
                UnityEditor.SceneManagement.EditorSceneManager.SaveOpenScenes();
                EditorApplication.isPlaying = true; // ← Activa Play automáticamente
            }
            else
            {
                EditorUtility.DisplayDialog(
                    "ZONA T RUNNER — Validación",
                    "Hay errores en la escena.\n\nEjecuta primero:\nZONA T RUNNER > Crear Escena Principal\n\nLuego vuelve a intentarlo.",
                    "OK");
            }
        }

        [MenuItem("ZONA T RUNNER/⏹ Detener Play", false, 3)]
        static void StopPlay()
        {
            EditorApplication.isPlaying = false;
        }
    }
}
