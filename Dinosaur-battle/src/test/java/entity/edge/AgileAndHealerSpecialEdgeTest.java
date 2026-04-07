package entity.edge;

import entity.Ankylosaurus;
import entity.Parasaurolophus;
import entity.Pterodactyl;
import entity.Spinosaurus;
import entity.TRex;
import entity.Triceratops;
import entity.Velociraptor;
import logic.StatusEffect;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("special")
public class AgileAndHealerSpecialEdgeTest {

    @Test
    public void testVelociraptorSpecialDamageAgainstSpino() {
        Velociraptor raptor = new Velociraptor();
        Spinosaurus spino = new Spinosaurus();
        int dmg = raptor.useSpecial(spino);
        assertEquals(32, dmg);
    }

    @Test
    public void testVelociraptorSpecialMinDamageAcrossTwoHits() {
        Velociraptor raptor = new Velociraptor();
        Ankylosaurus anky = new Ankylosaurus();
        int dmg = raptor.useSpecial(anky);
        assertTrue(dmg >= 2);
    }

    @Test
    public void testVelociraptorSpecialResetsGauge() {
        Velociraptor raptor = new Velociraptor();
        TRex target = new TRex();
        raptor.addGauge(100);
        raptor.useSpecial(target);
        assertEquals(0, raptor.getUltimateGauge());
    }

    @Test
    public void testPterodactylSpecialDamageAgainstTriceratops() {
        Pterodactyl ptero = new Pterodactyl();
        Triceratops target = new Triceratops();
        int dmg = ptero.useSpecial(target);
        assertEquals(11, dmg);
    }

    @Test
    public void testPterodactylSpecialAlwaysAppliesPoison() {
        Pterodactyl ptero = new Pterodactyl();
        Triceratops target = new Triceratops();
        ptero.useSpecial(target);
        assertTrue(target.hasStatus(StatusEffect.POISON));
    }

    @Test
    public void testPterodactylSpecialResetsGauge() {
        Pterodactyl ptero = new Pterodactyl();
        TRex target = new TRex();
        ptero.addGauge(100);
        ptero.useSpecial(target);
        assertEquals(0, ptero.getUltimateGauge());
    }

    @Test
    public void testParasaurolophusHealUsesStartAtTwo() {
        Parasaurolophus para = new Parasaurolophus();
        assertEquals(2, para.getHealUses());
    }

    @Test
    public void testParasaurolophusUseHealReturnsFortyPercentMaxHp() {
        Parasaurolophus para = new Parasaurolophus();
        para.takeDamage(100);
        int amount = para.useHeal();
        assertEquals(72, amount);
    }

    @Test
    public void testParasaurolophusUseHealConsumesAllUses() {
        Parasaurolophus para = new Parasaurolophus();
        para.useHeal();
        para.useHeal();
        assertFalse(para.canHeal());
        assertEquals(0, para.useHeal());
    }

    @Test
    public void testParasaurolophusSpecialDamageAgainstTriceratops() {
        Parasaurolophus para = new Parasaurolophus();
        Triceratops target = new Triceratops();
        int dmg = para.useSpecial(target);
        assertEquals(1, dmg);
    }
}
