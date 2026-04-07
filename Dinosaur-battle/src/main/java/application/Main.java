package application;

import gui.SceneManager;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {
    @Override
    public void start(Stage primaryStage) {
        SceneManager.setStage(primaryStage);

        primaryStage.setTitle("Dino Brawl");
        SceneManager.gotoMainMenu();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
