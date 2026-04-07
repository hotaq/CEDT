package entity;

import logic.DamageCalculator;

public class Pterodactyl extends Dinosaur {
    public Pterodactyl() {
        super("Pterodactyl", "resource/dinosuar/Pterodactyl.png", 150, 30, 10, 35, logic.Element.AGILE);
    }

    @Override
    public String getSpecialName() {
        return "Toxic Dive (Poison 2 Turns)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        int dmg = DamageCalculator.calculateSpecialDamage(this, target, 1.2);
        target.takeDamage(dmg);
        target.addStatus(logic.StatusEffect.POISON, 2);
        return dmg;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Pterodactyl-Toxic Dive.wav";
    }
}
