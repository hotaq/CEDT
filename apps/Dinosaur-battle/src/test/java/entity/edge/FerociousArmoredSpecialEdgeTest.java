package entity.edge;

import entity.Ankylosaurus;
import entity.Spinosaurus;
import entity.Stegosaurus;
import entity.TRex;
import entity.Triceratops;
import entity.Velociraptor;
import logic.StatusEffect;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("special")
public class FerociousArmoredSpecialEdgeTest {

    @Test
    public void testTRexSpecialResetsGaugeAfterUse() {
        TRex rex = new TRex();
        Triceratops target = new Triceratops();
        rex.addGauge(100);
        rex.useSpecial(target);
        assertEquals(0, rex.getUltimateGauge());
    }

    @Test
    public void testTRexSpecialDamageRange() {
        TRex rex = new TRex();
        Triceratops target = new Triceratops();

        for (int i = 0; i < 100; i++) {
            int damage = rex.useSpecial(target);
            assertTrue(damage == 0 || (damage >= 1 && damage <= 87));
        }
    }

    @Test
    public void testSpinosaurusSpecialIgnoresDefense() {
        Spinosaurus spino = new Spinosaurus();
        Ankylosaurus anky = new Ankylosaurus();
        int dmg = spino.useSpecial(anky);
        assertEquals(67, dmg);
    }

    @Test
    public void testSpinosaurusSpecialResetsGauge() {
        Spinosaurus spino = new Spinosaurus();
        TRex target = new TRex();
        spino.addGauge(100);
        spino.useSpecial(target);
        assertEquals(0, spino.getUltimateGauge());
    }

    @Test
    public void testTriceratopsSpecialSetsDefendingTrue() {
        Triceratops tri = new Triceratops();
        Velociraptor target = new Velociraptor();
        tri.useSpecial(target);
        assertTrue(tri.isDefending());
    }

    @Test
    public void testTriceratopsSpecialDamageAgainstVelociraptor() {
        Triceratops tri = new Triceratops();
        Velociraptor target = new Velociraptor();
        int dmg = tri.useSpecial(target);
        assertEquals(25, dmg);
    }

    @Test
    public void testAnkylosaurusSpecialDamageAgainstTrex() {
        Ankylosaurus anky = new Ankylosaurus();
        TRex target = new TRex();
        int dmg = anky.useSpecial(target);
        assertEquals(50, dmg);
    }

    @Test
    public void testStegosaurusSpecialDamageAgainstTrex() {
        Stegosaurus stego = new Stegosaurus();
        TRex target = new TRex();
        int dmg = stego.useSpecial(target);
        assertEquals(20, dmg);
    }

    @Test
    public void testStegosaurusSpecialCanApplyStunEventually() {
        Stegosaurus stego = new Stegosaurus();
        TRex target = new TRex();

        boolean stunnedAtLeastOnce = false;
        for (int i = 0; i < 200; i++) {
            stego.useSpecial(target);
            if (target.hasStatus(StatusEffect.STUN)) {
                stunnedAtLeastOnce = true;
                break;
            }
        }

        assertTrue(stunnedAtLeastOnce);
    }

    @Test
    public void testStegosaurusSpecialResetsGauge() {
        Stegosaurus stego = new Stegosaurus();
        TRex target = new TRex();
        stego.addGauge(100);
        stego.useSpecial(target);
        assertEquals(0, stego.getUltimateGauge());
    }
}
