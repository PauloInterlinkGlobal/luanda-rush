package com.lotador.game;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * O LOTADOR corre sempre em ecrã inteiro horizontal.
 *
 * A activity desenha-se de bordo a bordo (edge-to-edge), incluindo por baixo
 * dos recortes/entalhes do ecrã, e esconde as barras do sistema em modo
 * imersivo. Assim o WebView recebe toda a área disponível em paisagem — sem
 * margens nem faixas — e o fundo do jogo cobre também as safe areas, que são
 * respeitadas dentro do jogo via env(safe-area-inset-*).
 */
public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    applyFullBleed();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      applyFullBleed();
    }
  }

  private void applyFullBleed() {
    // O conteúdo passa a ocupar também a área das barras de sistema.
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

    // Permite desenhar por baixo do recorte (notch) em paisagem.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      getWindow().getAttributes().layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
    }

    getWindow().setStatusBarColor(Color.TRANSPARENT);
    getWindow().setNavigationBarColor(Color.TRANSPARENT);

    View decor = getWindow().getDecorView();
    WindowInsetsControllerCompat controller =
        WindowCompat.getInsetsController(getWindow(), decor);
    controller.hide(WindowInsetsCompat.Type.systemBars());
    controller.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
  }
}
