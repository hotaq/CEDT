package entity;

import logic.DamageCalculator;

public class Stegosaurus extends Dinosaur {
    public Stegosaurus() {
        super("Stegosaurus", "resource/dinosuar/Stegosaurus.png", 220, 30, 20, 15, logic.Element.ARMORED);
    }

    @Override
    public String getSpecialName() {
        return "Spike Tail (Stun 50%)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        int dmg = DamageCalculator.calculateSpecialDamage(this, target, 1.0);
        target.takeDamage(dmg);
        if (Math.random() <= 0.5) {
            target.addStatus(logic.StatusEffect.STUN, 1);
        }
        return dmg;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Stegosaurus-Spike Tail.wav";
    }
}
