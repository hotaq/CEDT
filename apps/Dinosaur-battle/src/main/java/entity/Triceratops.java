package entity;

import logic.DamageCalculator;

public class Triceratops extends Dinosaur {
    public Triceratops() {
        super("Triceratops", "resource/dinosuar/Triceratops.png", 220, 30, 25, 15, logic.Element.ARMORED);
    }

    @Override
    public String getSpecialName() {
        return "Horn Charge (Damage + Defend)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        this.isDefending = true;
        int dmg = DamageCalculator.calculateSpecialDamage(this, target, 1.5);
        target.takeDamage(dmg);
        return dmg;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Triceratops-Horn Charge.mp3";
    }
}
