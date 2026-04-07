package entity;

public class Ankylosaurus extends Dinosaur {
    public Ankylosaurus() {
        super("Ankylosaurus", "resource/dinosuar/Ankylosaurus.png", 250, 25, 35, 10, logic.Element.ARMORED);
    }

    @Override
    public String getSpecialName() {
        return "Tail Mace (Def->Dmg)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        int extraAtk = this.def;
        int finalAtk = this.atk + extraAtk;
        int dmg = Math.max(1, finalAtk - target.getDef());
        target.takeDamage(dmg);
        return dmg;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Ankylosaurus-Tail Mace.wav";
    }
}
