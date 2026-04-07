package entity;

import logic.DamageCalculator;
import logic.IHealable;

public class Parasaurolophus extends Dinosaur implements IHealable {
    private int healUses = 2;

    public Parasaurolophus() {
        super("Parasaurolophus", "resource/dinosuar/Parasaurolophus.png", 180, 25, 15, 20, logic.Element.AGILE);
    }

    @Override
    public String getSpecialName() {
        return "Sonic Boom (Small DMG + Heal)";
    }

    @Override
    public int useSpecial(Dinosaur target) {
        resetCooldown();
        int dmg = DamageCalculator.calculateSpecialDamage(this, target, 0.9);
        target.takeDamage(dmg);
        return dmg;
    }

    @Override
    public String getSpecialSound() {
        return "sound/Parasaurolophus-Sonic Boom.wav";
    }

    @Override
    public int getHealUses() {
        return healUses;
    }

    @Override
    public boolean canHeal() {
        return healUses > 0;
    }

    @Override
    public int useHeal() {
        if (!canHeal())
            return 0;
        healUses--;
        int amount = (int) (this.maxHp * 0.4);
        this.heal(amount);
        return amount;
    }
}
