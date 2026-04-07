package entity.edge;

import entity.Brachiosaurus;
import entity.Parasaurolophus;
import entity.Pterodactyl;
import entity.TRex;
import entity.Triceratops;
import logic.DamageCalculator;
import logic.StatusEffect;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("special")
public class BrachioAndIntegrationEdgeTest {

    @Test
    public void testBrachiosaurusSpecialAppliesEnrage() {
        Brachiosaurus brachio = new Brachiosaurus();
        TRex target = new TRex();
        brachio.useSpecial(target);
        assertTrue(brachio.hasStatus(StatusEffect.ENRAGE));
    }

    @Test
    public void testBrachiosaurusSpecialEnrageLastsThreeTurns() {
        Brachiosaurus brachio = new Brachiosaurus();
        TRex target = new TRex();
        brachio.useSpecial(target);

        brachio.onTurnStart();
        assertTrue(brachio.hasStatus(StatusEffect.ENRAGE));

        brachio.onTurnStart();
        assertTrue(brachio.hasStatus(StatusEffect.ENRAGE));

        brachio.onTurnStart();
        assertFalse(brachio.hasStatus(StatusEffect.ENRAGE));
    }

    @Test
    public void testBrachiosaurusSpecialDoesNoImmediateDamage() {
        Brachiosaurus brachio = new Brachiosaurus();
        TRex target = new TRex();
        int dmg = brachio.useSpecial(target);
        assertEquals(0, dmg);
    }

    @Test
    public void testBrachiosaurusSpecialResetsGauge() {
        Brachiosaurus brachio = new Brachiosaurus();
        TRex target = new TRex();
        brachio.addGauge(100);
        brachio.useSpecial(target);
        assertEquals(0, brachio.getUltimateGauge());
    }

    @Test
    public void testFerociousVsArmoredBonusApplied() {
        TRex attacker = new TRex();
        Triceratops defender = new Triceratops();
        int damage = DamageCalculator.calculateNormalDamage(attacker, defender);
        assertEquals(37, damage);
    }

    @Test
    public void testNoDodgeOutsideFerociousVsAgileMatchup() {
        Triceratops attacker = new Triceratops();
        Brachiosaurus defender = new Brachiosaurus();
        for (int i = 0; i < 100; i++) {
            int damage = DamageCalculator.calculateNormalDamage(attacker, defender);
            assertTrue(damage >= 1);
        }
    }

    @Test
    public void testDefendingHalvesSpecialDamage() {
        TRex attacker = new TRex();
        Triceratops defender = new Triceratops();

        int withoutDefense = DamageCalculator.calculateSpecialDamage(attacker, defender, 1.8);
        defender.setDefending(true);
        int withDefense = DamageCalculator.calculateSpecialDamage(attacker, defender, 1.8);

        assertEquals(withoutDefense / 2, withDefense);
    }

    @Test
    public void testEnragedDefenderLosesDefenseInDamageCalc() {
        TRex attacker = new TRex();
        Triceratops defender = new Triceratops();

        int baseDamage = DamageCalculator.calculateNormalDamage(attacker, defender);
        defender.addStatus(StatusEffect.ENRAGE, 2);
        int enragedDefenderDamage = DamageCalculator.calculateNormalDamage(attacker, defender);

        assertTrue(enragedDefenderDamage > baseDamage);
    }

    @Test
    public void testParasaurolophusSpecialResetsGauge() {
        Parasaurolophus para = new Parasaurolophus();
        TRex target = new TRex();
        para.addGauge(100);
        para.useSpecial(target);
        assertEquals(0, para.getUltimateGauge());
    }

    @Test
    public void testPterodactylPoisonTickDealsExpectedDamageAfterSpecial() {
        Pterodactyl ptero = new Pterodactyl();
        Triceratops target = new Triceratops();

        ptero.useSpecial(target);
        int hpAfterSpecial = target.getHp();
        target.onTurnStart();

        assertEquals(hpAfterSpecial - 11, target.getHp());
    }
}
