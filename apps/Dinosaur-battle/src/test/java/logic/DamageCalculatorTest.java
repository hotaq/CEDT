package logic;

import entity.*;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@Tag("core")
public class DamageCalculatorTest {

    @Test
    public void testNormalDamageFerociousVsArmored() {
        TRex rex = new TRex(); // atk 50, FEROCIOUS
        Triceratops tri = new Triceratops(); // def 25, ARMORED
        // FEROCIOUS vs ARMORED: 50 * 1.25 = 62. 62 - 25 = 37.
        int dmg = DamageCalculator.calculateNormalDamage(rex, tri);
        assertEquals(37, dmg);
    }

    @Test
    public void testNormalDamageArmoredVsAgile() {
        Triceratops tri = new Triceratops(); // atk 30, ARMORED
        Velociraptor raptor = new Velociraptor(); // def 8, AGILE
        // ARMORED vs AGILE: 30 * 0.75 = 22. 22 - 8 = 14.
        int dmg = DamageCalculator.calculateNormalDamage(tri, raptor);
        assertEquals(14, dmg);
    }

    @Test
    public void testNormalDamageNeutral() {
        TRex rex1 = new TRex(); // atk 50
        Spinosaurus spino = new Spinosaurus(); // def 12 (Both FEROCIOUS)
        // 50 * 1.0 = 50. 50 - 12 = 38
        int dmg = DamageCalculator.calculateNormalDamage(rex1, spino);
        assertEquals(38, dmg);
    }

    @Test
    public void testDodgeMechanic() {
        TRex rex = new TRex(); // FEROCIOUS
        Velociraptor raptor = new Velociraptor(); // AGILE

        // Agile has 20% chance to dodge Ferocious.
        // We run it 100 times, it's highly improbable to not see at least one dodge and
        // one hit.
        boolean dodged = false;
        boolean hit = false;
        for (int i = 0; i < 100; i++) {
            int dmg = DamageCalculator.calculateNormalDamage(rex, raptor);
            if (dmg == 0)
                dodged = true;
            if (dmg > 0)
                hit = true;
        }
        assertTrue(dodged, "Velociraptor should have dodged at least once in 100 tries");
        assertTrue(hit, "TRex should have hit at least once in 100 tries");
    }

    @Test
    public void testDefendingDamage() {
        TRex rex = new TRex(); // atk 50
        Triceratops tri = new Triceratops(); // def 25
        tri.setDefending(true);
        int dmg = DamageCalculator.calculateNormalDamage(rex, tri);
        assertEquals(18, dmg); // 37 / 2 = 18
    }

    @Test
    public void testEnrageStatusAttacker() {
        Brachiosaurus brach = new Brachiosaurus(); // atk 20
        brach.addStatus(StatusEffect.ENRAGE, 2);
        Triceratops tri = new Triceratops(); // def 25
        int dmg = DamageCalculator.calculateNormalDamage(brach, tri);
        // atk = 20 * 1.5 = 30. 30 - 25 = 5
        assertEquals(5, dmg);
    }

    @Test
    public void testEnrageStatusDefender() {
        TRex rex = new TRex(); // atk 50
        Spinosaurus spino = new Spinosaurus(); // def 12
        spino.addStatus(StatusEffect.ENRAGE, 1);
        int dmg = DamageCalculator.calculateNormalDamage(rex, spino);
        // Def halved: 12 / 2 = 6.
        // Atk 50 - 6 = 44
        assertEquals(44, dmg);
    }

    @Test
    public void testMinimumDamage() {
        // High def vs Low atk
        Brachiosaurus brach = new Brachiosaurus(); // atk 20, ARMORED
        Ankylosaurus anky = new Ankylosaurus(); // def 35, ARMORED
        // 20 - 35 = -15, should clamp to 1.
        int dmg = DamageCalculator.calculateNormalDamage(brach, anky);
        assertEquals(1, dmg);
    }

    @Test
    public void testSpecialDamage() {
        TRex rex = new TRex(); // atk 50, FEROCIOUS
        Triceratops tri = new Triceratops(); // def 25, ARMORED
        // Multiplier = 1.8
        // Atk: 50 * 1.8 = 90.
        // FEROCIOUS vs ARMORED multiplier: 90 * 1.25 = 112
        // Damage: 112 - 25 = 87
        int dmg = DamageCalculator.calculateSpecialDamage(rex, tri, 1.8);
        assertEquals(87, dmg);
    }
}
