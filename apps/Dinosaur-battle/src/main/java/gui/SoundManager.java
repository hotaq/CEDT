package gui;

import javafx.scene.media.AudioClip;
import java.io.File;

public class SoundManager {
    private static javafx.scene.media.MediaPlayer bgmPlayer;
    private static double sfxVolume = 1.0;
    private static double bgmVolume = 0.3;

    public static void volumeUp() {
        sfxVolume = Math.min(1.0, sfxVolume + 0.1);
        bgmVolume = Math.min(1.0, bgmVolume + 0.1);
        if (bgmPlayer != null)
            bgmPlayer.setVolume(bgmVolume);
    }

    public static void volumeDown() {
        sfxVolume = Math.max(0.0, sfxVolume - 0.1);
        bgmVolume = Math.max(0.0, bgmVolume - 0.1);
        if (bgmPlayer != null)
            bgmPlayer.setVolume(bgmVolume);
    }

    public static int getVolumePercent() {
        return (int) Math.round(sfxVolume * 100);
    }

    public static void setVolumePercent(int pct) {
        double v = Math.max(0.0, Math.min(1.0, pct / 100.0));
        sfxVolume = v;
        bgmVolume = v * 0.3;
        if (bgmPlayer != null) {
            bgmPlayer.setVolume(bgmVolume);
        }
    }

    public static void playSound(String path) {
        try {
            File f = new File(path);
            if (!f.exists() && !path.contains("/")) {
                f = new File(path + ".wav"); // Fallback to old behavior for "click" etc.
            }
            if (f.exists()) {
                AudioClip clip = new AudioClip(f.toURI().toString());
                clip.setVolume(sfxVolume);
                clip.play();
            } else {
                System.out.println("[SFX] Missing sound file: " + path);
            }
        } catch (Exception e) {
            System.out.println("[SFX] Error playing sound: " + path);
        }
    }

    public static void playBGM() {
        try {
            if (bgmPlayer != null) {
                bgmPlayer.play();
                return;
            }
            File f = new File("sound/background song.mp3");
            if (f.exists()) {
                javafx.scene.media.Media media = new javafx.scene.media.Media(f.toURI().toString());
                bgmPlayer = new javafx.scene.media.MediaPlayer(media);
                bgmPlayer.setVolume(bgmVolume);
                bgmPlayer.setCycleCount(javafx.scene.media.MediaPlayer.INDEFINITE);
                bgmPlayer.play();
            } else {
                System.out.println("[BGM] Missing BGM file: sound/background song.mp3");
            }
        } catch (Exception e) {
            System.out.println("[BGM] Error playing background music...");
        }
    }
}
