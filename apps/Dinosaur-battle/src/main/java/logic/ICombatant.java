package logic;

public interface ICombatant {
    int takeDamage(int amount);

    void heal(int amount);

    boolean isAlive();

    boolean isDefending();
}
