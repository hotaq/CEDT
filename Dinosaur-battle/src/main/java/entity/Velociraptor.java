package entity;

import logic.DamageCalculator;

public class Velociraptor extends Dinosaur {
    public Velociraptor() {
        super("Velociraptor", "resource/dinosuar/Velociraptor.png", 140, 35, 8, 40, logic.Element.AGILE);
    }

    @Override
    public String getSpecialName() {
        return "Swift Dash (Double Hit)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        int hit1 = DamageCalculator.calculateSpecialDamage(this, target, 0.8);
        target.takeDamage(hit1);
        int hit2 = DamageCalculator.calculateSpecialDamage(this, target, 0.8);
        target.takeDamage(hit2);
        return hit1 + hit2;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Velociraptor-Swift Dash.mp3";
    }
}
