package entity;

public class Spinosaurus extends Dinosaur {
    public Spinosaurus() {
        super("Spinosaurus", "resource/dinosuar/Spinosaurus.png", 180, 45, 12, 25, logic.Element.FEROCIOUS);
    }

    @Override
    public String getSpecialName() {
        return "Pierce Claws (Pierce DEF)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        // Pierces defense by skipping DamageCalculator's DEF reduction
        int dmg = (int) (this.atk * 1.5);
        target.takeDamage(dmg);
        return dmg;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Spinosaurus-Pierce Claws.wav";
    }
}
