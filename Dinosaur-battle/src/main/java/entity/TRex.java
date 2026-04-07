package entity;

import logic.DamageCalculator;

public class TRex extends Dinosaur {
    public TRex() {
        super("T-Rex", "resource/dinosuar/T-rex.png", 200, 50, 10, 20, logic.Element.FEROCIOUS);
    }

    @Override
    public String getSpecialName() {
        return "Bite (High DMG, 70% Acc)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        if (Math.random() <= 0.70) {
            int dmg = DamageCalculator.calculateSpecialDamage(this, target, 1.8);
            target.takeDamage(dmg);
            return dmg;
        }
        return 0; // Miss
    }

    @Override
    public String getSpecialSound() {
        return "sound/Trex-Bite.wav";
    }

    @Override
    public boolean isFacingRight() {
        return false;
    }
}
