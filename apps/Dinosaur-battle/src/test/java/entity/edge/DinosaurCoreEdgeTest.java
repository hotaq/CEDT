package entity.edge;

import entity.Parasaurolophus;
import entity.Spinosaurus;
import entity.TRex;
import entity.Triceratops;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("core")
public class DinosaurCoreEdgeTest {

    @Test
    public void testTakeDamageZeroKeepsHp() {
        TRex rex = new TRex();
        rex.takeDamage(0);
        assertEquals(200, rex.getHp());
    }

    @Test
    public void testTakeDamageReducesHpExactly() {
        TRex rex = new TRex();
        rex.takeDamage(37);
        assertEquals(163, rex.getHp());
    }

    @Test
    public void testTakeDamageCapsAtZero() {
        TRex rex = new TRex();
        rex.takeDamage(999);
        assertEquals(0, rex.getHp());
        assertFalse(rex.isAlive());
    }

    @Test
    public void testHealCannotExceedMaxHp() {
        Parasaurolophus para = new Parasaurolophus();
        para.takeDamage(30);
        para.heal(999);
        assertEquals(180, para.getHp());
    }

    @Test
    public void testTakeDamageAddsGaugeByTen() {
        Spinosaurus spino = new Spinosaurus();
        spino.takeDamage(1);
        assertEquals(10, spino.getUltimateGauge());
    }

    @Test
    public void testGaugeCapsAtHundredOnRepeatedDamage() {
        Spinosaurus spino = new Spinosaurus();
        for (int i = 0; i < 50; i++) {
            spino.takeDamage(1);
        }
        assertEquals(100, spino.getUltimateGauge());
    }

    @Test
    public void testAddGaugeCapsAtHundred() {
        Triceratops tri = new Triceratops();
        tri.addGauge(999);
        assertEquals(100, tri.getUltimateGauge());
    }

    @Test
    public void testCanUseSpecialTrueAtHundred() {
        Triceratops tri = new Triceratops();
        tri.addGauge(100);
        assertTrue(tri.canUseSpecial());
    }

    @Test
    public void testCanUseSpecialFalseBelowHundred() {
        Triceratops tri = new Triceratops();
        tri.addGauge(99);
        assertFalse(tri.canUseSpecial());
    }

    @Test
    public void testResetCooldownSetsGaugeToZero() {
        Triceratops tri = new Triceratops();
        tri.addGauge(100);
        tri.resetCooldown();
        assertEquals(0, tri.getUltimateGauge());
    }
}
