package gui;

import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Slider;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import java.io.File;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

public class MainMenuPane extends StackPane {
    public MainMenuPane() {
        this.setStyle("-fx-background-color: #1a1a1a;");

        ImageView bgView = new ImageView();
        try {
            File bgFile = new File("resource/backroung.png");
            if (!bgFile.exists()) {
                bgFile = new File("background/battle_bg.jpg");
            }
            if (bgFile.exists()) {
                Image bgImage = new Image(bgFile.toURI().toString());
                bgView.setImage(bgImage);
                bgView.fitWidthProperty().bind(this.widthProperty());
                bgView.fitHeightProperty().bind(this.heightProperty());
            }
        } catch (Exception e) {
        }

        VBox uiBox = new VBox(25);
        uiBox.setAlignment(Pos.CENTER);

        Text title = new Text("DINO BRAWL");
        title.setFont(Font.font("Arial", FontWeight.EXTRA_BOLD, 65));
        title.setStyle(
                "-fx-fill: linear-gradient(to bottom, #f39c12, #e67e22); -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.8), 10, 0, 2, 2);");

        Button startBtn = createStyledButton("Start Game");
        startBtn.setOnAction(e -> SceneManager.gotoCharacterSelect());

        Button helpBtn = createStyledButton("How to Play");
        helpBtn.setOnAction(e -> {
            javafx.scene.control.Alert alert = new javafx.scene.control.Alert(
                    javafx.scene.control.Alert.AlertType.INFORMATION);
            alert.setTitle("How to Play");
            alert.setHeaderText("Welcome to Dino Brawl");
            alert.setContentText(
                    "1. Select 3 Dinosaurs for each player.\n2. Take turns performing actions: Attack, Special, or Heal.\n3. Defeat the enemy team to win!");
            alert.showAndWait();
        });

        HBox volumeBox = new HBox(10);
        volumeBox.setAlignment(Pos.CENTER);
        Text volText = new Text("🔊 Volume");
        volText.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        volText.setStyle("-fx-fill: #f0f0f0;");
        Slider volSlider = new Slider(0, 100, SoundManager.getVolumePercent());
        volSlider.setPrefWidth(170);
        volSlider.setStyle("-fx-control-inner-background: rgba(255,255,255,0.2);");
        volSlider.valueProperty().addListener((obs, oldV, newV) -> {
            SoundManager.setVolumePercent(newV.intValue());
        });
        volumeBox.getChildren().addAll(volText, volSlider);

        Button exitBtn = createStyledButton("Exit");
        exitBtn.setOnAction(e -> System.exit(0));

        uiBox.getChildren().addAll(title, startBtn, helpBtn, volumeBox, exitBtn);
        this.getChildren().addAll(bgView, uiBox);

        SoundManager.playBGM();
    }

    private Button createStyledButton(String text) {
        Button btn = new Button(text);
        btn.setFont(Font.font("Arial", FontWeight.BOLD, 22));
        String baseStyle = "-fx-background-color: #2c3e50; -fx-text-fill: white; -fx-padding: 12 30; -fx-background-radius: 8; -fx-border-color: #34495e; -fx-border-radius: 8; -fx-border-width: 2; -fx-cursor: hand; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.6), 5, 0, 0, 2);";
        String hoverStyle = "-fx-background-color: #34495e; -fx-text-fill: #f1c40f; -fx-padding: 12 30; -fx-background-radius: 8; -fx-border-color: #f1c40f; -fx-border-radius: 8; -fx-border-width: 2; -fx-cursor: hand; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.8), 8, 0, 0, 3);";
        btn.setStyle(baseStyle);
        btn.setOnMouseEntered(e -> btn.setStyle(hoverStyle));
        btn.setOnMouseExited(e -> btn.setStyle(baseStyle));
        btn.setPrefWidth(250);
        return btn;
    }
}
