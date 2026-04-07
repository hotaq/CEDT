package entity;

public class Brachiosaurus extends Dinosaur {
    public Brachiosaurus() {
        super("Brachiosaurus", "resource/dinosuar/Brachiosaurus.png", 300, 20, 15, 5, logic.Element.ARMORED);
    }

    @Override
    public String getSpecialName() {
        return "Primal Roar (Enrage)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        this.addStatus(logic.StatusEffect.ENRAGE, 3);
        return 0; // Deals no immediate damage
    }

    @Override
    public String getSpecialSound() {
        return "sound/Brachiosaurus-Primal Roar (Enrage).wav";
    }

    @Override
    public boolean isFacingRight() {
        return false;
    }
}
