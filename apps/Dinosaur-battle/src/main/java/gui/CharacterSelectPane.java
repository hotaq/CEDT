package gui;

import entity.*;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ContentDisplay;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.VBox;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class CharacterSelectPane extends StackPane {
    private List<Dinosaur> p1Team = new ArrayList<>();
    private List<Dinosaur> p2Team = new ArrayList<>();
    private boolean isP1Picking = true;
    private Label instructionLabel;
    private HBox selectedBox;

    public CharacterSelectPane() {
        try {
            File bgFile = new File("resource/backroung.png");
            if (!bgFile.exists()) {
                bgFile = new File("background/battle_bg.jpg");
            }
            if (bgFile.exists()) {
                ImageView bgView = new ImageView(new Image(bgFile.toURI().toString()));
                bgView.fitWidthProperty().bind(this.widthProperty());
                bgView.fitHeightProperty().bind(this.heightProperty());
                this.getChildren().add(bgView);
            } else {
                this.setStyle("-fx-background-color: #333;");
            }
        } catch (Exception e) {
        }

        VBox mainBox = new VBox(20);
        mainBox.setAlignment(Pos.CENTER);
        mainBox.setPadding(new Insets(20));

        instructionLabel = new Label("Player 1, select your Dinosaurs! (0/3)");
        instructionLabel.setFont(Font.font("Arial", FontWeight.BOLD, 28));
        instructionLabel.setStyle(
                "-fx-text-fill: white; -fx-background-color: rgba(0,0,0,0.5); -fx-padding: 10 20; -fx-background-radius: 10;");

        GridPane roster = new GridPane();
        roster.setAlignment(Pos.CENTER);
        roster.setHgap(15);
        roster.setVgap(15);
        roster.setPickOnBounds(false); // Let clicks fall exactly through to cards

        Dinosaur[] allDinos = {
                new TRex(), new Spinosaurus(), new Velociraptor(),
                new Triceratops(), new Ankylosaurus(), new Stegosaurus(),
                new Pterodactyl(), new Parasaurolophus(), new Brachiosaurus()
        };

        int col = 0, row = 0;
        for (Dinosaur d : allDinos) {
            VBox card = createDinoCard(d);
            roster.add(card, col, row);
            col++;
            if (col > 2) {
                col = 0;
                row++;
            }
        }

        selectedBox = new HBox(20);
        selectedBox.setAlignment(Pos.CENTER);
        selectedBox.setStyle("-fx-background-color: rgba(0,0,0,0.5); -fx-padding: 10; -fx-background-radius: 10;");
        selectedBox.setPrefHeight(100);
        selectedBox.setMinHeight(100);
        selectedBox.setPickOnBounds(false); // <--- Prevent intercepting clicks
        selectedBox.setMouseTransparent(true); // <--- Pass clicks through completely

        mainBox.setPickOnBounds(false); // <--- Also prevent the main VBox from greedy event consumption

        mainBox.getChildren().addAll(instructionLabel, roster, selectedBox);
        this.getChildren().add(mainBox);

        Button backBtn = new Button("← Back to Home");
        backBtn.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        String baseBtnStyle = "-fx-background-color: #2c3e50; -fx-text-fill: white; -fx-padding: 8 14; -fx-background-radius: 8; -fx-border-color: #f1c40f; -fx-border-width: 1.5; -fx-border-radius: 8; -fx-cursor: hand;";
        String hoverBtnStyle = "-fx-background-color: #34495e; -fx-text-fill: #f1c40f; -fx-padding: 8 14; -fx-background-radius: 8; -fx-border-color: #f1c40f; -fx-border-width: 1.5; -fx-border-radius: 8; -fx-cursor: hand; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.8), 8, 0, 0, 3);";
        backBtn.setStyle(baseBtnStyle);
        backBtn.setOnMouseEntered(e -> backBtn.setStyle(hoverBtnStyle));
        backBtn.setOnMouseExited(e -> backBtn.setStyle(baseBtnStyle));
        backBtn.setOnAction(e -> {
            System.out.println("Back to Home clicked from Character Select");
            SceneManager.gotoMainMenu();
        });
        StackPane.setAlignment(backBtn, Pos.TOP_LEFT);
        StackPane.setMargin(backBtn, new Insets(20));
        this.getChildren().add(backBtn);
        backBtn.toFront();
    }

    private VBox createDinoCard(Dinosaur d) {
        VBox card = new VBox(5);
        card.setAlignment(Pos.CENTER);
        card.setPadding(new Insets(10));

        String borderColor = "white";
        if (d.getElement() == logic.Element.FEROCIOUS) {
            borderColor = "#ff4757";
        } else if (d.getElement() == logic.Element.ARMORED) {
            borderColor = "#1e90ff";
        } else if (d.getElement() == logic.Element.AGILE) {
            borderColor = "#2ed573";
        }

        String baseStyle = "-fx-background-color: #2f3542; -fx-border-color: " + borderColor
                + "; -fx-border-width: 3; -fx-border-radius: 8; -fx-background-radius: 8; -fx-cursor: hand;";
        String hoverStyle = "-fx-background-color: #57606f; -fx-border-color: " + borderColor
                + "; -fx-border-width: 4; -fx-border-radius: 8; -fx-background-radius: 8; -fx-cursor: hand; -fx-effect: dropshadow(gaussian, rgba(255,255,255,0.4), 10, 0, 0, 0);";

        card.setStyle(baseStyle);
        card.setPrefSize(180, 200);

        try {
            File imgFile = new File(d.getImageFile());
            if (imgFile.exists()) {
                ImageView imgView = new ImageView(new Image(imgFile.toURI().toString()));
                imgView.setFitWidth(120);
                imgView.setFitHeight(120);
                imgView.setPreserveRatio(true);
                imgView.setMouseTransparent(true); // Don't let the image eat clicks meant for the card
                card.getChildren().add(imgView);
            }
        } catch (Exception e) {
        }

        Label nameLabel = new Label(d.getName());
        nameLabel.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        nameLabel.setStyle("-fx-text-fill: white;");

        Label elementLabel = new Label(d.getElement().toString());
        elementLabel.setFont(Font.font("Arial", 12));
        elementLabel.setStyle("-fx-text-fill: " + borderColor + ";");

        card.getChildren().addAll(nameLabel, elementLabel);

        // --- Fix mouse interaction overlapping issue inside the card itself ---
        card.setPickOnBounds(true); // MUST be true so the *whole card area* is clickable, not just the text/image
                                    // pixels
        nameLabel.setMouseTransparent(true);
        elementLabel.setMouseTransparent(true);

        card.setOnMouseEntered(e -> {
            card.setStyle(hoverStyle);
            card.setScaleX(1.05);
            card.setScaleY(1.05);
        });
        card.setOnMouseExited(e -> {
            card.setStyle(baseStyle);
            card.setScaleX(1.0);
            card.setScaleY(1.0);
        });
        card.setOnMouseClicked(e -> handleSelection(d));

        return card;
    }

    private void updateSelectedBox(Dinosaur d) {
        try {
            File imgFile = new File(d.getImageFile());
            if (imgFile.exists()) {
                ImageView imgView = new ImageView(new Image(imgFile.toURI().toString()));
                imgView.setFitWidth(60);
                imgView.setFitHeight(60);
                imgView.setPreserveRatio(true);
                Label l = new Label(d.getName(), imgView);
                l.setContentDisplay(ContentDisplay.TOP);
                l.setStyle("-fx-text-fill: white; -fx-font-size: 12px; -fx-font-weight: bold;");
                selectedBox.getChildren().add(l);
            }
        } catch (Exception ex) {
        }
    }

    private void handleSelection(Dinosaur selected) {
        Dinosaur d = instantiateDino(selected.getClass().getSimpleName());
        updateSelectedBox(d);

        if (isP1Picking) {
            p1Team.add(d);
            instructionLabel.setText("Player 1, select your Dinosaurs! (" + p1Team.size() + "/3)");
            if (p1Team.size() == 3) {
                isP1Picking = false;
                instructionLabel.setText("Player 2, select your Dinosaurs! (0/3)");
                instructionLabel.setStyle(
                        "-fx-text-fill: #f1c40f; -fx-background-color: rgba(0,0,0,0.6); -fx-padding: 10 20; -fx-background-radius: 10;");
                selectedBox.getChildren().clear();
            }
        } else {
            p2Team.add(d);
            instructionLabel.setText("Player 2, select your Dinosaurs! (" + p2Team.size() + "/3)");
            if (p2Team.size() == 3) {
                SceneManager.gotoBattle(p1Team, p2Team);
            }
        }
    }

    private Dinosaur instantiateDino(String className) {
        switch (className) {
            case "TRex":
                return new TRex();
            case "Spinosaurus":
                return new Spinosaurus();
            case "Velociraptor":
                return new Velociraptor();
            case "Triceratops":
                return new Triceratops();
            case "Ankylosaurus":
                return new Ankylosaurus();
            case "Stegosaurus":
                return new Stegosaurus();
            case "Pterodactyl":
                return new Pterodactyl();
            case "Parasaurolophus":
                return new Parasaurolophus();
            case "Brachiosaurus":
                return new Brachiosaurus();
            default:
                return new TRex();
        }
    }
}
