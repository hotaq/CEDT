package entity;

import logic.StatusEffect;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@Tag("special")
public class DinosaurTest {

    @Test
    public void testHPCapping() {
        TRex rex = new TRex(); // Max HP 200

        // Take damage below 0
        rex.takeDamage(300);
        assertEquals(0, rex.getHp(), "HP should not drop below 0");
        assertFalse(rex.isAlive(), "Dinosaur should be dead at 0 HP");

        // Heal above max
        Parasaurolophus para = new Parasaurolophus(); // Max HP 180
        para.takeDamage(50);
        para.heal(100);
        assertEquals(180, para.getHp(), "HP should cap at maxHp");
    }

    @Test
    public void testUltimateGauge() {
        Spinosaurus spino = new Spinosaurus();

        // Taking damage grants 10 gauge
        spino.takeDamage(10);
        assertEquals(10, spino.getUltimateGauge());

        // Max cap
        spino.addGauge(200);
        assertEquals(100, spino.getUltimateGauge(), "Gauge should cap at 100");
        assertTrue(spino.canUseSpecial());

        // Reset
        spino.resetCooldown();
        assertEquals(0, spino.getUltimateGauge());
        assertFalse(spino.canUseSpecial());
    }

    @Test
    public void testStatusEffectDurations() {
        Triceratops tri = new Triceratops();
        tri.addStatus(StatusEffect.STUN, 2);

        assertTrue(tri.hasStatus(StatusEffect.STUN));

        // Turn 1
        tri.onTurnStart();
        assertTrue(tri.hasStatus(StatusEffect.STUN)); // Still active for this turn

        // Turn 2
        tri.onTurnStart();
        assertFalse(tri.hasStatus(StatusEffect.STUN)); // Ticked down to 0
    }

    @Test
    public void testPoisonDamage() {
        Stegosaurus stego = new Stegosaurus(); // Max HP 220
        stego.addStatus(StatusEffect.POISON, 3);

        // Poison does 5% max HP per turn. 220 * 0.05 = 11.
        stego.onTurnStart();
        assertEquals(220 - 11, stego.getHp());

        stego.onTurnStart();
        assertEquals(220 - 22, stego.getHp());
    }

    @Test
    public void testHealSkill() {
        Parasaurolophus para = new Parasaurolophus(); // IHealable, Heal uses = 2
        para.takeDamage(100);

        assertTrue(para.canHeal());
        para.useHeal(); // Uses 1 stack, heals 40% (180 * 0.4 = 72)
        assertEquals(180 - 100 + 72, para.getHp());

        assertTrue(para.canHeal());
        para.useHeal();

        assertFalse(para.canHeal(), "Should run out of heal uses");
        int hpBeforeFail = para.getHp();
        para.useHeal();
        assertEquals(hpBeforeFail, para.getHp(), "Healing when empty should do nothing");
    }

    @Test
    public void testTRexSpecialMiss() {
        TRex rex = new TRex();
        Triceratops tri = new Triceratops();

        rex.addGauge(100);

        // 70% chance to hit. If we test 100 times, it should miss at least once and hit
        // at least once.
        boolean missed = false;
        boolean hit = false;

        for (int i = 0; i < 100; i++) {
            rex.addGauge(100); // Reload gauge
            int dmg = rex.useSpecial(tri);

            if (dmg == 0)
                missed = true;
            if (dmg > 0)
                hit = true;
        }

        assertTrue(missed, "TRex special should miss at least once in 100 tries");
        assertTrue(hit, "TRex special should hit at least once in 100 tries");
    }

    @Test
    public void testAnkylosaurusSpecial() {
        Ankylosaurus d = new Ankylosaurus();
        TRex target = new TRex(); // def 10
        // Anky special: customAtkMultiplier = 1.
        // Atk 25 * 1.0 = 25. 25 - 10 = 15. Then add Anky def (35) = 50.
        int dmg = d.useSpecial(target);
        assertEquals(50, dmg);
    }

    @Test
    public void testBrachiosaurusSpecial() {
        Brachiosaurus d = new Brachiosaurus();
        TRex target = new TRex();
        // Brachio special adds Enrage and does 0 damage.
        int dmg = d.useSpecial(target);
        assertEquals(0, dmg);
        assertTrue(d.hasStatus(StatusEffect.ENRAGE));
    }

    @Test
    public void testParasaurolophusSpecial() {
        Parasaurolophus d = new Parasaurolophus();
        Triceratops target = new Triceratops(); // def 25
        // Para special: 0.8 mult + self heal.
        // Atk 25 * 0.8 = 20. 20 - 25 = -5 -> clamp to 1.
        int dmg = d.useSpecial(target);
        assertEquals(1, dmg); // clamped to 1
    }

    @Test
    public void testPterodactylSpecial() {
        Pterodactyl d = new Pterodactyl();
        Triceratops target = new Triceratops(); // def 25
        // Ptero special: 1.2 mult
        // Atk 30 * 1.2 = 36. 36 - 25 = 11.
        int dmg = d.useSpecial(target);
        assertEquals(11, dmg);
        assertTrue(target.hasStatus(StatusEffect.POISON));
    }

    @Test
    public void testSpinosaurusSpecial() {
        Spinosaurus d = new Spinosaurus();
        Velociraptor target = new Velociraptor();
        // Spino special: piercing dmg = atk * 1.5. Atk is 45.
        // 45 * 1.5 = 67.5 -> 67 (int truncated).
        int dmg = d.useSpecial(target);
        assertEquals(67, dmg);
    }

    @Test
    public void testStegosaurusSpecial() {
        Stegosaurus d = new Stegosaurus();
        TRex target = new TRex(); // def 10
        // Stego special is normal damage calculation + 50% stun chance.
        // Atk 30, ARMORED vs FEROCIOUS is neutral. 30 - 10 = 20.
        int dmg = d.useSpecial(target);
        assertEquals(20, dmg);
    }

    @Test
    public void testTriceratopsSpecial() {
        Triceratops d = new Triceratops();
        assertEquals("Triceratops", d.getName());
        assertEquals(logic.Element.ARMORED, d.getElement());

        Velociraptor target = new Velociraptor(); // def 8
        // Trike special: 1.5 mult + defending state.
        // Atk 30 * 1.5 = 45. ARMORED vs AGILE element penalty: 45 * 0.75 = 33. 33 - 8 =
        // 25
        int dmg = d.useSpecial(target);
        assertEquals(25, dmg);
        assertTrue(d.isDefending());
    }

    @Test
    public void testVelociraptorSpecial() {
        Velociraptor d = new Velociraptor();
        assertEquals("Velociraptor", d.getName());
        assertEquals(logic.Element.AGILE, d.getElement());

        Spinosaurus target = new Spinosaurus(); // def 12
        // Raptor special: Swift Dash (Double Hit) 0.8x twice.
        // Hit 1: Atk 35 * 0.8 = 28. Penalty Ag vs Fe is neutral. 28 - 12 = 16.
        // Total damage = 16 * 2 = 32
        int dmg = d.useSpecial(target);
        assertEquals(32, dmg);
    }
}
