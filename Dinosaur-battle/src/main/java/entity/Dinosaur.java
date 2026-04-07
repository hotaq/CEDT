package entity;

import logic.ICombatant;
import logic.StatusEffect;
import java.util.HashMap;
import java.util.Map;

public abstract class Dinosaur implements ICombatant {
    protected String name;
    protected String imageFile;
    protected int maxHp;
    protected int hp;
    protected int atk;
    protected int def;
    protected int spd;
    protected logic.Element element;

    protected int ultimateGauge = 0;
    protected static final int MAX_GAUGE = 100;
    protected boolean isDefending = false;

    protected Map<StatusEffect, Integer> statusDurations = new HashMap<>();

    public Dinosaur(String name, String imageFile, int hp, int atk, int def, int spd, logic.Element element) {
        this.name = name;
        this.imageFile = imageFile;
        this.maxHp = hp;
        this.hp = hp;
        this.atk = atk;
        this.def = def;
        this.spd = spd;
        this.element = element;
    }

    public int takeDamage(int amount) {
        this.hp -= amount;
        if (this.hp < 0)
            this.hp = 0;
        addGauge(10); // +10% on being hit
        return amount;
    }

    public void heal(int amount) {
        this.hp += amount;
        if (this.hp > this.maxHp)
            this.hp = this.maxHp;
    }

    public boolean isAlive() {
        return this.hp > 0;
    }

    public boolean isDefending() {
        return this.isDefending;
    }

    public int getNormalAttack() {
        return this.atk;
    }

    public int getDef() {
        return this.def;
    }

    public boolean isFacingRight() {
        return true; // Make default true since most dinosaurs face right (except TRex and
                     // Brachiosaurus)
    }

    public abstract String getSpecialName();

    public abstract int useSpecial(Dinosaur target);

    public String getNormalSound() {
        return "sound/Hit.wav"; // Default hit sound
    }

    public abstract String getSpecialSound();

    public void addStatus(StatusEffect effect, int duration) {
        if (effect == StatusEffect.NONE)
            return;
        statusDurations.put(effect, duration);
    }

    public boolean hasStatus(StatusEffect effect) {
        return statusDurations.getOrDefault(effect, 0) > 0;
    }

    public void processTurnStatuses() {
        if (hasStatus(StatusEffect.POISON)) {
            int poisonDmg = (int) (this.maxHp * 0.05);
            this.takeDamage(poisonDmg);
            System.out.println(this.name + " took " + poisonDmg + " poison damage!");
        }

        for (StatusEffect effect : statusDurations.keySet()) {
            int turns = statusDurations.get(effect);
            if (turns > 0) {
                statusDurations.put(effect, turns - 1);
            }
        }
    }

    public void onTurnStart() {
        this.isDefending = false;
        processTurnStatuses();
    }

    public void addGauge(int amount) {
        this.ultimateGauge += amount;
        if (this.ultimateGauge > MAX_GAUGE) {
            this.ultimateGauge = MAX_GAUGE;
        }
    }

    public boolean canUseSpecial() {
        return ultimateGauge >= MAX_GAUGE;
    }

    public void resetCooldown() {
        this.ultimateGauge = 0;
    }

    public String getName() {
        return name;
    }

    public String getImageFile() {
        return imageFile;
    }

    public int getHp() {
        return hp;
    }

    public int getMaxHp() {
        return maxHp;
    }

    public int getSpd() {
        return spd;
    }

    public int getUltimateGauge() {
        return ultimateGauge;
    }

    public logic.Element getElement() {
        return element;
    }

    public void setDefending(boolean val) {
        this.isDefending = val;
    }
}
