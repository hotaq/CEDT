package logic;

import entity.*;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@Tag("status")
public class StatusEffectTest {

    @Test
    public void testPoisonStatus() {
        TRex rex = new TRex(); // hp 200
        rex.addStatus(StatusEffect.POISON, 2);

        assertTrue(rex.hasStatus(StatusEffect.POISON));

        int initialHp = rex.getHp(); // 200
        rex.processTurnStatuses();

        // POISON deals maxHp * 0.05 = 200 * 0.05 = 10
        assertEquals(initialHp - 10, rex.getHp());

        rex.processTurnStatuses();
        assertEquals(initialHp - 20, rex.getHp());
        assertFalse(rex.hasStatus(StatusEffect.POISON));
    }

    @Test
    public void testEnrageStatus() {
        TRex rex = new TRex();
        Triceratops tri = new Triceratops();

        rex.addStatus(StatusEffect.ENRAGE, 1);

        // Normal attack should do 1.5x damage
        // TRex base atk: 50. vs Tri: 50 * 1.5 (Enrage) = 75. 75 * 1.25 (element) =
        // 93.75 -> 93. 93 - 25 = 68.
        int dmg = DamageCalculator.calculateNormalDamage(rex, tri);
        assertEquals(68, dmg);

        rex.processTurnStatuses();
        assertFalse(rex.hasStatus(StatusEffect.ENRAGE));
    }

    @Test
    public void testStunStatus() {
        TRex rex = new TRex();
        rex.addStatus(StatusEffect.STUN, 1);
        assertTrue(rex.hasStatus(StatusEffect.STUN));
        rex.processTurnStatuses();
        assertFalse(rex.hasStatus(StatusEffect.STUN));
    }
}
