package gui;

import javafx.scene.Scene;
import javafx.stage.Stage;

import java.util.List;
import entity.Dinosaur;

public class SceneManager {
    private static Stage stage;

    public static void setStage(Stage s) {
        stage = s;
        stage.setTitle("Dino Brawl");
        stage.setResizable(true);
    }

    public static void gotoMainMenu() {
        stage.setScene(new Scene(new MainMenuPane(), 1200, 800));
        stage.centerOnScreen();
        stage.show();
    }

    public static void gotoCharacterSelect() {
        stage.setScene(new Scene(new CharacterSelectPane(), 1200, 800));
        stage.centerOnScreen();
        stage.show();
    }

    public static void gotoBattle(List<Dinosaur> p1, List<Dinosaur> p2) {
        try {
            System.out.println("Transitioning to BattlePane...");
            BattlePane bp = new BattlePane(p1, p2);
            stage.setScene(new Scene(bp, 1200, 800));
            stage.centerOnScreen();
            stage.show();
            System.out.println("Successfully transitioned to BattlePane!");
        } catch (Throwable e) {
            System.err.println("CRASH DURING GOTO BATTLE:");
            e.printStackTrace();
        }
    }
}
