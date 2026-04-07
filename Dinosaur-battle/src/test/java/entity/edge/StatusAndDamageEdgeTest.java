package entity.edge;

import entity.Ankylosaurus;
import entity.Brachiosaurus;
import entity.Stegosaurus;
import entity.TRex;
import entity.Triceratops;
import entity.Velociraptor;
import logic.DamageCalculator;
import logic.StatusEffect;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("status")
public class StatusAndDamageEdgeTest {

    @Test
    public void testOnTurnStartClearsDefending() {
        Triceratops tri = new Triceratops();
        tri.setDefending(true);
        tri.onTurnStart();
        assertFalse(tri.isDefending());
    }

    @Test
    public void testAddStatusNoneIsIgnored() {
        Triceratops tri = new Triceratops();
        tri.addStatus(StatusEffect.NONE, 3);
        assertFalse(tri.hasStatus(StatusEffect.NONE));
    }

    @Test
    public void testAddStatusOverwritesDuration() {
        Triceratops tri = new Triceratops();
        tri.addStatus(StatusEffect.STUN, 3);
        tri.addStatus(StatusEffect.STUN, 1);
        tri.onTurnStart();
        assertFalse(tri.hasStatus(StatusEffect.STUN));
    }

    @Test
    public void testPoisonDamageUsesFivePercentMaxHp() {
        Stegosaurus stego = new Stegosaurus();
        stego.addStatus(StatusEffect.POISON, 1);
        stego.onTurnStart();
        assertEquals(209, stego.getHp());
    }

    @Test
    public void testPoisonTicksAlsoIncreaseGauge() {
        TRex rex = new TRex();
        rex.addStatus(StatusEffect.POISON, 1);
        rex.onTurnStart();
        assertEquals(10, rex.getUltimateGauge());
    }

    @Test
    public void testMultipleStatusesTickTogether() {
        TRex rex = new TRex();
        rex.addStatus(StatusEffect.POISON, 2);
        rex.addStatus(StatusEffect.STUN, 2);
        rex.onTurnStart();
        assertTrue(rex.hasStatus(StatusEffect.POISON));
        assertTrue(rex.hasStatus(StatusEffect.STUN));
        rex.onTurnStart();
        assertFalse(rex.hasStatus(StatusEffect.POISON));
        assertFalse(rex.hasStatus(StatusEffect.STUN));
    }

    @Test
    public void testDefendingHalvesNormalDamage() {
        TRex attacker = new TRex();
        Triceratops defender = new Triceratops();

        int withoutDefense = DamageCalculator.calculateNormalDamage(attacker, defender);
        defender.setDefending(true);
        int withDefense = DamageCalculator.calculateNormalDamage(attacker, defender);

        assertEquals(withoutDefense / 2, withDefense);
    }

    @Test
    public void testEnragedAttackerBoostsNormalDamage() {
        Triceratops attacker = new Triceratops();
        TRex defender = new TRex();

        int baseDamage = DamageCalculator.calculateNormalDamage(attacker, defender);
        attacker.addStatus(StatusEffect.ENRAGE, 2);
        int enragedDamage = DamageCalculator.calculateNormalDamage(attacker, defender);

        assertTrue(enragedDamage > baseDamage);
    }

    @Test
    public void testArmoredVsAgilePenaltyApplied() {
        Triceratops attacker = new Triceratops();
        Velociraptor defender = new Velociraptor();
        int damage = DamageCalculator.calculateNormalDamage(attacker, defender);
        assertEquals(14, damage);
    }

    @Test
    public void testMinimumDamageClampIsOne() {
        Brachiosaurus attacker = new Brachiosaurus();
        Ankylosaurus defender = new Ankylosaurus();
        int damage = DamageCalculator.calculateNormalDamage(attacker, defender);
        assertEquals(1, damage);
    }
}
