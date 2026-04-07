package logic;

public interface IHealable {
    int getHealUses();

    boolean canHeal();

    int useHeal();
}
