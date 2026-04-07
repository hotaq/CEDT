package gui;

import entity.Dinosaur;
import logic.IHealable;
import logic.StatusEffect;
import java.io.File;
import java.util.List;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

public class BattlePane extends StackPane {
    private List<Dinosaur> p1Team;
    private List<Dinosaur> p2Team;
    private int p1Index = 0;
    private int p2Index = 0;
    private boolean isPlayer1Turn;
    private boolean isActionLocked = false;

    private Label turnLabel;
    private Label logLabel;
    private VBox p1Box;
    private VBox p2Box;
    private ImageView p1Face;
    private ImageView p2Face;
    private HBox skillBox;
    private ImageView p1ImgView;
    private ImageView p2ImgView;
    private ProgressBar p1HpBar;
    private ProgressBar p2HpBar;
    private Label p1HpLabel;
    private Label p2HpLabel;
    private HBox characterPane;

    public BattlePane(List<Dinosaur> p1Team, List<Dinosaur> p2Team) {
        this.p1Team = p1Team;
        this.p2Team = p2Team;

        isPlayer1Turn = p1Team.get(0).getSpd() >= p2Team.get(0).getSpd();

        setupVisuals();
        updateUI();
        getActiveDino().onTurnStart();
        SoundManager.playBGM();
    }

    private void setupVisuals() {
        try {
            File bgFile = new File("resource/backroung.png");
            if (!bgFile.exists()) {
                bgFile = new File("background/backroung.png");
            }
            if (bgFile.exists()) {
                Image bgImage = new Image(bgFile.toURI().toString());
                ImageView bgView = new ImageView(bgImage);
                bgView.fitWidthProperty().bind(this.widthProperty());
                bgView.fitHeightProperty().bind(this.heightProperty());
                this.getChildren().add(bgView);
            } else {
                this.setStyle("-fx-background-color: #2F4F4F;");
            }
        } catch (Exception e) {
            this.setStyle("-fx-background-color: #2F4F4F;");
        }

        BorderPane mainLayout = new BorderPane();
        mainLayout.setPadding(new Insets(20));

        VBox topBox = new VBox(10);
        topBox.setAlignment(Pos.CENTER);

        HBox topBar = new HBox();
        topBar.setAlignment(Pos.CENTER);

        Button quitBtn = createButton("🚪 Quit Battle");
        quitBtn.setStyle(
                "-fx-background-color: #c0392b; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 5 15; -fx-background-radius: 5;");
        quitBtn.setOnAction(e -> SceneManager.gotoMainMenu());

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Volume Control — Slider style (matches main menu)
        HBox volumeBox = new HBox(8);
        volumeBox.setAlignment(Pos.CENTER_RIGHT);
        Label volLabel = createStyledLabel("🔊", 14, Color.WHITE);
        javafx.scene.control.Slider volSlider = new javafx.scene.control.Slider(0, 100,
                SoundManager.getVolumePercent());
        volSlider.setPrefWidth(120);
        volSlider.setStyle("-fx-control-inner-background: rgba(255,255,255,0.15);");
        Label volPctLabel = createStyledLabel(SoundManager.getVolumePercent() + "%", 13, Color.LIGHTGRAY);
        volPctLabel.setMinWidth(35);
        volSlider.valueProperty().addListener((obs, oldVal, newVal) -> {
            int pct = newVal.intValue();
            SoundManager.setVolumePercent(pct);
            volPctLabel.setText(pct + "%");
        });
        volumeBox.getChildren().addAll(volLabel, volSlider, volPctLabel);

        topBar.getChildren().addAll(quitBtn, spacer, volumeBox);
        turnLabel = createStyledLabel("", 28, Color.YELLOW);
        turnLabel.setStyle(
                "-fx-font-weight: bold; -fx-background-color: rgba(0,0,0,0.7); -fx-padding: 5 15; -fx-background-radius: 10;");

        HBox healthBox = new HBox(30);
        healthBox.setAlignment(Pos.CENTER);

        // P1 Health Box
        HBox p1Wrapper = new HBox(10);
        p1Wrapper.setAlignment(Pos.CENTER_LEFT);
        p1Wrapper.setStyle(
                "-fx-background-color: rgba(30, 40, 50, 0.85); -fx-padding: 12; -fx-background-radius: 12; -fx-border-color: #e74c3c; -fx-border-radius: 12; -fx-border-width: 2; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.6), 8, 0, 0, 4);");
        p1Face = new ImageView();
        p1Face.setFitWidth(50);
        p1Face.setFitHeight(50);
        p1Face.setPreserveRatio(true);
        p1Box = new VBox(8);
        p1Box.setAlignment(Pos.CENTER);
        p1Box.setPrefWidth(200);
        p1HpBar = new ProgressBar(1.0);
        p1HpBar.setPrefWidth(220);
        p1HpBar.setPrefHeight(20);
        p1HpBar.setStyle("-fx-accent: red;");
        p1HpLabel = createStyledLabel("", 16, Color.WHITE);
        p1Wrapper.getChildren().addAll(p1Face, p1Box);

        Label vsLabel = new Label("VS");
        vsLabel.setFont(Font.font("Arial", FontWeight.EXTRA_BOLD, 40));
        vsLabel.setTextFill(Color.WHITE);
        vsLabel.setStyle("-fx-effect: dropshadow(gaussian, rgba(255, 0, 0, 0.8), 10, 0, 0, 0);");

        // P2 Health Box
        HBox p2Wrapper = new HBox(10);
        p2Wrapper.setAlignment(Pos.CENTER_RIGHT);
        p2Wrapper.setStyle(
                "-fx-background-color: rgba(30, 40, 50, 0.85); -fx-padding: 12; -fx-background-radius: 12; -fx-border-color: #3498db; -fx-border-radius: 12; -fx-border-width: 2; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.6), 8, 0, 0, 4);");
        p2Face = new ImageView();
        p2Face.setFitWidth(50);
        p2Face.setFitHeight(50);
        p2Face.setPreserveRatio(true);
        p2Box = new VBox(8);
        p2Box.setAlignment(Pos.CENTER);
        p2Box.setPrefWidth(200);
        p2HpBar = new ProgressBar(1.0);
        p2HpBar.setPrefWidth(220);
        p2HpBar.setPrefHeight(20);
        p2HpBar.setStyle("-fx-accent: red;");
        p2HpLabel = createStyledLabel("", 16, Color.WHITE);
        p2Wrapper.getChildren().addAll(p2Box, p2Face);

        logLabel = createStyledLabel("Battle Start!", 20, Color.WHITE);
        logLabel.setStyle(
                "-fx-background-color: rgba(0,0,0,0.55); -fx-padding: 10 24; -fx-background-radius: 10; -fx-border-color: #AAA; -fx-border-radius: 10; -fx-border-width: 1;");
        logLabel.setMaxWidth(Double.MAX_VALUE);
        logLabel.setAlignment(Pos.CENTER);
        VBox.setMargin(logLabel, new Insets(10, 50, 0, 50));

        healthBox.getChildren().addAll(p1Wrapper, vsLabel, p2Wrapper);
        topBox.getChildren().addAll(topBar, turnLabel, healthBox, logLabel);
        mainLayout.setTop(topBox);

        characterPane = new HBox(120);
        characterPane.setAlignment(Pos.BOTTOM_CENTER);
        characterPane.setTranslateY(-100); // Move upwards slightly from center

        VBox char1Base = new VBox(-10); // Slight negative overlap to make shadow fit tightly
        char1Base.setAlignment(Pos.BOTTOM_CENTER);
        p1ImgView = new ImageView();
        p1ImgView.setFitWidth(280);
        p1ImgView.setFitHeight(250);
        p1ImgView.setPreserveRatio(true);
        javafx.scene.shape.Ellipse shadow1 = new javafx.scene.shape.Ellipse(80, 15);
        shadow1.setFill(Color.color(0, 0, 0, 0.4));
        char1Base.getChildren().addAll(p1ImgView, shadow1);

        VBox char2Base = new VBox(-10);
        char2Base.setAlignment(Pos.BOTTOM_CENTER);
        p2ImgView = new ImageView();
        p2ImgView.setFitWidth(280);
        p2ImgView.setFitHeight(250);
        p2ImgView.setPreserveRatio(true);
        javafx.scene.shape.Ellipse shadow2 = new javafx.scene.shape.Ellipse(80, 15);
        shadow2.setFill(Color.color(0, 0, 0, 0.4));
        char2Base.getChildren().addAll(p2ImgView, shadow2);

        characterPane.getChildren().addAll(char1Base, char2Base);

        startIdleAnimation(p1ImgView);
        startIdleAnimation(p2ImgView);

        VBox bottomBox = new VBox(10);
        bottomBox.setAlignment(Pos.CENTER);
        skillBox = new HBox(20);
        skillBox.setAlignment(Pos.CENTER);
        skillBox.setPadding(new Insets(16));
        skillBox.setStyle("-fx-background-color: rgba(0,0,0,0.5); -fx-background-radius: 15;");

        bottomBox.getChildren().addAll(skillBox);
        bottomBox.setPadding(new Insets(0, 0, 20, 0)); // Padding to prevent hugging bottom edge
        mainLayout.setBottom(bottomBox);

        characterPane.setMouseTransparent(true); // Allow clicking through dinosaurs to the buttons behind
        this.getChildren().addAll(mainLayout, characterPane); // Draw characterPane ON TOP of mainLayout
    }

    private void startIdleAnimation(ImageView img) {
        javafx.animation.TranslateTransition tt = new javafx.animation.TranslateTransition(
                javafx.util.Duration.millis(1500), img);
        tt.setByY(-8f);
        tt.setCycleCount(javafx.animation.Animation.INDEFINITE);
        tt.setAutoReverse(true);
        tt.play();
    }

    private Dinosaur getP1Dino() {
        return p1Team.get(p1Index);
    }

    private Dinosaur getP2Dino() {
        return p2Team.get(p2Index);
    }

    private Dinosaur getActiveDino() {
        return isPlayer1Turn ? getP1Dino() : getP2Dino();
    }

    private Dinosaur getTargetDino() {
        return isPlayer1Turn ? getP2Dino() : getP1Dino();
    }

    private boolean isTeamDead(List<Dinosaur> team) {
        for (Dinosaur d : team) {
            if (d.isAlive())
                return false;
        }
        return true;
    }

    private int findNextAliveIndex(List<Dinosaur> team) {
        for (int i = 0; i < team.size(); i++) {
            if (team.get(i).isAlive())
                return i;
        }
        return -1;
    }

    private void updateUI() {
        Dinosaur d1 = getP1Dino();
        Dinosaur d2 = getP2Dino();

        updateDinoBox(p1Box, p1HpBar, p1HpLabel, d1);
        updateDinoBox(p2Box, p2HpBar, p2HpLabel, d2);

        if (isTeamDead(p1Team) || isTeamDead(p2Team)) {
            endGame();
            return;
        }

        try {
            File f1 = new File(d1.getImageFile());
            if (f1.exists()) {
                Image img1 = new Image(f1.toURI().toString());
                p1ImgView.setImage(img1);
                p1Face.setImage(img1); // Update portrait face
            }
            File f2 = new File(d2.getImageFile());
            if (f2.exists()) {
                Image img2 = new Image(f2.toURI().toString());
                p2ImgView.setImage(img2);
                p2Face.setImage(img2); // Update portrait face
            }

            // P1 (left side) always faces RIGHT, P2 (right side) always faces LEFT
            // isFacingRight() tells us if the sprite's natural orientation is right-facing
            p1ImgView.setScaleX(d1.isFacingRight() ? 1 : -1); // P1: face right
            p2ImgView.setScaleX(d2.isFacingRight() ? -1 : 1); // P2: mirror to face left (toward P1)
        } catch (Exception e) {
        }

        turnLabel.setText((isPlayer1Turn ? "Player 1's " : "Player 2's ") + getActiveDino().getName() + " Turn");
        turnLabel.setTextFill(isPlayer1Turn ? Color.CYAN : Color.ORANGE);

        skillBox.getChildren().clear();
        Dinosaur active = getActiveDino();
        Dinosaur target = getTargetDino();

        Button btnNormal = createButton("⚔️ Attack (" + active.getNormalAttack() + ")");
        btnNormal.setStyle(
                "-fx-background-color: #c0392b; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10 20; -fx-background-radius: 8; -fx-font-size: 16px;");
        btnNormal.setOnAction(e -> executeAction(0, active, target));

        Button btnSpecial = createButton("✨ " + active.getSpecialName() + " [" + active.getUltimateGauge() + "%]");
        btnSpecial.setStyle(
                "-fx-background-color: #8e44ad; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10 20; -fx-background-radius: 8; -fx-font-size: 16px;");
        btnSpecial.setDisable(!active.canUseSpecial());
        btnSpecial.setOnAction(e -> executeAction(1, active, target));

        Button btnDefend = createButton("🛡️ Defend");
        btnDefend.setStyle(
                "-fx-background-color: #f39c12; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10 20; -fx-background-radius: 8; -fx-font-size: 16px;");
        btnDefend.setOnAction(e -> executeAction(3, active, target));

        skillBox.getChildren().addAll(btnNormal, btnSpecial, btnDefend);

        if (active instanceof IHealable) {
            IHealable healable = (IHealable) active;
            Button btnHeal = createButton("🩹 Heal (" + healable.getHealUses() + ")");
            btnHeal.setStyle(
                    "-fx-background-color: #27ae60; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10 20; -fx-background-radius: 8; -fx-font-size: 16px;");
            btnHeal.setDisable(!healable.canHeal());
            btnHeal.setOnAction(e -> executeAction(2, active, target));
            skillBox.getChildren().add(btnHeal);
        }

        // Only allow swapping if team has more than 1 alive
        List<Dinosaur> myTeam = isPlayer1Turn ? p1Team : p2Team;
        long aliveCount = myTeam.stream().filter(Dinosaur::isAlive).count();
        if (aliveCount > 1) {
            Button btnSwap = createButton("🔄 Swap");
            btnSwap.setStyle(
                    "-fx-background-color: #2980b9; -fx-text-fill: white; -fx-font-weight: bold; -fx-padding: 10 20; -fx-background-radius: 8; -fx-font-size: 16px;");
            btnSwap.setOnAction(e -> executeSwap());
            skillBox.getChildren().add(btnSwap);
        }
    }

    private void executeSwap() {
        if (isActionLocked)
            return;
        if (isPlayer1Turn) {
            do {
                p1Index = (p1Index + 1) % p1Team.size();
            } while (!p1Team.get(p1Index).isAlive());
        } else {
            do {
                p2Index = (p2Index + 1) % p2Team.size();
            } while (!p2Team.get(p2Index).isAlive());
        }

        logLabel.setText(getActiveDino().getName() + " switched in!");
        SoundManager.playSound("sound/Hit.wav"); // Swap sound
        isPlayer1Turn = !isPlayer1Turn;

        if (!isTeamDead(p1Team) && !isTeamDead(p2Team)) {
            getActiveDino().onTurnStart();
        }
        updateUI();
    }

    private void updateDinoBox(VBox box, ProgressBar bar, Label hpLbl, Dinosaur d) {
        String statusText = "";
        if (d.getElement() == logic.Element.FEROCIOUS)
            statusText += " 🔴";
        else if (d.getElement() == logic.Element.ARMORED)
            statusText += " 🔵";
        else if (d.getElement() == logic.Element.AGILE)
            statusText += " 🟢";

        if (d.isDefending())
            statusText += " [DEF]";
        if (d.hasStatus(StatusEffect.POISON))
            statusText += " [POISON]";
        if (d.hasStatus(StatusEffect.ENRAGE))
            statusText += " [ENRAGE]";

        if (box.getChildren().isEmpty()) {
            Label nameLbl = createStyledLabel(d.getName() + statusText, 20, Color.WHITE);
            box.getChildren().addAll(nameLbl, bar, hpLbl);
        } else {
            ((Label) box.getChildren().get(0)).setText(d.getName() + statusText);
        }
        double pct = (double) d.getHp() / d.getMaxHp();
        bar.setProgress(pct);
        if (pct > 0.5) {
            bar.setStyle("-fx-accent: #2ecc71;"); // Green
        } else if (pct > 0.25) {
            bar.setStyle("-fx-accent: #f1c40f;"); // Yellow
        } else {
            bar.setStyle("-fx-accent: #e74c3c;"); // Red
        }
        hpLbl.setText(Math.max(0, d.getHp()) + " / " + d.getMaxHp());
    }

    private Button createButton(String text) {
        Button btn = new Button(text);
        btn.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        btn.setStyle(
                "-fx-background-color: #333333; -fx-text-fill: white; -fx-padding: 10 20; -fx-border-color: white; -fx-border-width: 2; -fx-border-radius: 5; -fx-background-radius: 5;");
        return btn;
    }

    private void executeAction(int type, Dinosaur attacker, Dinosaur target) {
        if (isActionLocked)
            return;
        isActionLocked = true;
        skillBox.setDisable(true);
        String logText = "";
        boolean victimIsP1 = !isPlayer1Turn;

        SoundManager.playSound("sound/Hit.wav");

        if (type == 0) {
            int dmg = logic.DamageCalculator.calculateNormalDamage(attacker, target);
            if (dmg == 0) {
                logText = attacker.getName() + " attacked but " + target.getName() + " DODGED!";
                showPopup(victimIsP1, "DODGED", Color.LIGHTGRAY);
            } else {
                target.takeDamage(dmg);
                logText = attacker.getName() + " used Normal Attack dealing " + dmg + " damage!";
                showPopup(victimIsP1, "-" + dmg, Color.RED);
            }
            playAnim(isPlayer1Turn);
            SoundManager.playSound(attacker.getNormalSound());
        } else if (type == 1) {
            shakeScreen(); // Shake screen on special
            int result = attacker.useSpecial(target);
            if (result == 0 && attacker.hasStatus(StatusEffect.ENRAGE)) {
                logText = attacker.getName() + " became Enraged!";
                showPopup(!victimIsP1, "ENRAGE!", Color.ORANGE);
            } else if (result == 0 && attacker instanceof entity.TRex) {
                logText = attacker.getName() + " used " + attacker.getSpecialName() + " but MISSED!";
                showPopup(victimIsP1, "MISS", Color.GRAY);
            } else if (result == 0 && target.getElement() == logic.Element.AGILE) {
                logText = attacker.getName() + " used Special but " + target.getName() + " DODGED!";
                showPopup(victimIsP1, "DODGED", Color.LIGHTGRAY);
            } else {
                logText = attacker.getName() + " used " + attacker.getSpecialName() + " dealing " + result + " damage!";
                showPopup(victimIsP1, "-" + result, Color.RED);
            }
            playAnim(isPlayer1Turn);
            SoundManager.playSound(attacker.getSpecialSound());
        } else if (type == 2 && attacker instanceof IHealable) {
            int amt = ((IHealable) attacker).useHeal();
            logText = attacker.getName() + " healed for " + amt + " HP!";
            showPopup(!victimIsP1, "+" + amt, Color.GREEN);
            SoundManager.playSound("sound/Hit.wav"); // Basic heal sound
        } else if (type == 3) {
            attacker.setDefending(true);
            logText = attacker.getName() + " takes a defensive stance!";
            showPopup(!victimIsP1, "DEFEND", Color.ORANGE);
            SoundManager.playSound("sound/Hit.wav");
        }

        logLabel.setText(logText);
        checkWinCondition();

        // Spam prevention cooldown limit
        new Thread(() -> {
            try {
                Thread.sleep(500);
                Platform.runLater(() -> {
                    isActionLocked = false;
                    skillBox.setDisable(false);
                });
            } catch (Exception e) {
            }
        }).start();
    }

    private void checkWinCondition() {
        Dinosaur target = getTargetDino();
        if (!target.isAlive()) {
            logLabel.setText(logLabel.getText() + "\n" + target.getName() + " is defeated!");
            SoundManager.playSound("sound/Hit.wav"); // Default roar substitute

            if (!isPlayer1Turn) { // P2 attacked P1, P1 died
                int next = findNextAliveIndex(p1Team);
                if (next != -1)
                    p1Index = next;
            } else {
                int next = findNextAliveIndex(p2Team);
                if (next != -1)
                    p2Index = next;
            }
        }

        isPlayer1Turn = !isPlayer1Turn;

        if (!isTeamDead(p1Team) && !isTeamDead(p2Team)) {
            Dinosaur nextActive = getActiveDino();
            // Need to process poison before turn starts formally, but onTurnStart handles
            // it.
            nextActive.onTurnStart();

            // If poisoned to death during turn start
            if (!nextActive.isAlive()) {
                logLabel.setText(logLabel.getText() + "\n" + nextActive.getName() + " succumbed to poison!");
                if (isPlayer1Turn) {
                    int next = findNextAliveIndex(p1Team);
                    if (next != -1)
                        p1Index = next;
                } else {
                    int next = findNextAliveIndex(p2Team);
                    if (next != -1)
                        p2Index = next;
                }
                isPlayer1Turn = !isPlayer1Turn; // Skip turn
                if (!isTeamDead(p1Team) && !isTeamDead(p2Team)) {
                    getActiveDino().onTurnStart();
                }
            } else if (nextActive.hasStatus(StatusEffect.STUN)) {
                logLabel.setText(logLabel.getText() + "\n" + nextActive.getName() + " is STUNNED and skips the turn!");
                nextActive.processTurnStatuses();
                isPlayer1Turn = !isPlayer1Turn; // Skip back
                if (!isTeamDead(p1Team) && !isTeamDead(p2Team)) {
                    getActiveDino().onTurnStart();
                }
            }
        }
        updateUI();
    }

    private void playAnim(boolean p1) {
        ImageView v = p1 ? p1ImgView : p2ImgView;
        double tx = p1 ? 100 : -100;
        new Thread(() -> {
            try {
                Platform.runLater(() -> v.setTranslateX(tx));
                Thread.sleep(150);
                Platform.runLater(() -> v.setTranslateX(0));
            } catch (Exception e) {
            }
        }).start();
    }

    private void shakeScreen() {
        BorderPane main = (BorderPane) this.getChildren().get(1);
        new Thread(() -> {
            for (int i = 0; i < 6; i++) {
                try {
                    Platform.runLater(() -> {
                        main.setTranslateX((Math.random() * 20 - 10));
                        main.setTranslateY((Math.random() * 20 - 10));
                    });
                    Thread.sleep(50);
                } catch (Exception e) {
                }
            }
            Platform.runLater(() -> {
                main.setTranslateX(0);
                main.setTranslateY(0);
            });
        }).start();
    }

    private void showPopup(boolean isPlayer1Target, String text, Color color) {
        Label popup = createStyledLabel(text, 36, color);

        Platform.runLater(() -> {
            popup.setTranslateX(isPlayer1Target ? -150 : 150);
            popup.setTranslateY(-50);
            this.getChildren().add(popup);
        });

        new Thread(() -> {
            try {
                for (int i = 0; i < 30; i++) {
                    Thread.sleep(30);
                    final double newY = -50 - (i * 3);
                    final double opacity = 1.0 - (i / 30.0);
                    Platform.runLater(() -> {
                        popup.setTranslateY(newY);
                        popup.setOpacity(opacity);
                    });
                }
                Platform.runLater(() -> this.getChildren().remove(popup));
            } catch (Exception e) {
            }
        }).start();
    }

    private void endGame() {
        skillBox.getChildren().clear();
        boolean p1Wins = !isTeamDead(p1Team);
        logLabel.setText(p1Wins ? "Player 1 Wins Team Battle!" : "Player 2 Wins Team Battle!");
        turnLabel.setText("GAME OVER");

        Button backBtn = createButton("Back to Menu");
        backBtn.setOnAction(e -> SceneManager.gotoMainMenu());
        skillBox.getChildren().add(backBtn);
    }

    private Label createStyledLabel(String text, double size, Color color) {
        Label label = new Label(text);
        label.setFont(Font.font("Arial", FontWeight.BOLD, size));
        label.setTextFill(color);
        label.setStyle("-fx-effect: dropshadow( gaussian , rgba(0,0,0,0.8) , 3,0,1,1 );");
        return label;
    }
}
