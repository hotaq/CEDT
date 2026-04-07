package logic;

import entity.Dinosaur;

public class DamageCalculator {
    public static int calculateNormalDamage(Dinosaur attacker, Dinosaur defender) {
        // Agile vs Ferocious Dodge check
        if (defender.getElement() == logic.Element.AGILE && attacker.getElement() == logic.Element.FEROCIOUS) {
            if (Math.random() <= 0.20) {
                return 0; // Dodged
            }
        }

        int atk = attacker.getNormalAttack();
        if (attacker.hasStatus(StatusEffect.ENRAGE)) {
            atk = (int) (atk * 1.5);
        }

        int def = defender.getDef();
        if (defender.hasStatus(StatusEffect.ENRAGE)) {
            def = def / 2; // Enraged unit has less defense
        }

        double elementalMultiplier = 1.0;
        if (attacker.getElement() == logic.Element.FEROCIOUS && defender.getElement() == logic.Element.ARMORED) {
            elementalMultiplier = 1.25;
        } else if (attacker.getElement() == logic.Element.ARMORED && defender.getElement() == logic.Element.AGILE) {
            elementalMultiplier = 0.75;
        }

        int damage = Math.max(1, (int) (atk * elementalMultiplier) - def);

        if (defender.isDefending()) {
            damage /= 2;
        }

        return damage;
    }

    public static int calculateSpecialDamage(Dinosaur attacker, Dinosaur defender, double atkMultiplier) {
        // Agile vs Ferocious Dodge check
        if (defender.getElement() == logic.Element.AGILE && attacker.getElement() == logic.Element.FEROCIOUS) {
            if (Math.random() <= 0.20) {
                return 0; // Dodged
            }
        }

        int atk = (int) (attacker.getNormalAttack() * atkMultiplier);
        if (attacker.hasStatus(StatusEffect.ENRAGE)) {
            atk = (int) (atk * 1.5);
        }

        int def = defender.getDef();
        if (defender.hasStatus(StatusEffect.ENRAGE)) {
            def = def / 2;
        }

        double elementalMultiplier = 1.0;
        if (attacker.getElement() == logic.Element.FEROCIOUS && defender.getElement() == logic.Element.ARMORED) {
            elementalMultiplier = 1.25;
        } else if (attacker.getElement() == logic.Element.ARMORED && defender.getElement() == logic.Element.AGILE) {
            elementalMultiplier = 0.75;
        }

        int damage = Math.max(1, (int) (atk * elementalMultiplier) - def);

        if (defender.isDefending()) {
            damage /= 2;
        }

        return damage;
    }
}
