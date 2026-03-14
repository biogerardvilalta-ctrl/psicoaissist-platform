# Flujo de Trabajo Git Recomendado

Las ramas del repositorio están directamente asociadas a la gestión de entornos:

## 1. Ramas (Branches)
- **`main`**: Es la rama de **Producción (Prod)**. Contiene el código inestable que está expuesto a clientes reales en el servidor.
- **`preprod`**: Es la rama de **Pre-producción**. Entorno de staging usado para certificar funcionalidades antes de exponerlas en Producción.
- **`development`**: Es la rama base de **Desarrollo (Dev)**. El punto de partida de los desarrolladores y el entorno para la integración continua.

## 2. El Ciclo de Creación

### Paso A: Empezar algo nuevo
Siempre crea una rama desde `development` actualizado:

```bash
git checkout development
git pull origin development
git checkout -b feature/nueva-funcionalidad
```

### Paso B: Trabajar
Haces tus cambios, pruebas en tu PC y guardas:

```bash
git add .
git commit -m "Añado nueva funcionalidad X"
```

### Paso C: Subir cambios
Sube tu rama a GitLab/GitHub:

```bash
git push origin feature/nueva-funcionalidad
```

### Paso D: Fusionar (Merge) -> Flujo a Producción

1. **De Tarea a Integración local:** Crea un **Merge Request** de tu rama `feature/...` hacia `development`. Revisa tu código y dale a Merge.
2. **Despliegue a Staging:** Cuando hay múltiples tareas en `development` listas para probar, crea un **Merge Request** de `development` hacia `preprod`. Al hacer merge, GitHub Actions desplegará en el servidor de preprod automáticamente.
3. **Despliegue a Producción:** Una vez validadas las pruebas en el entorno de pre-producción, se crea el último **Merge Request** de `preprod` hacia `main`. Tras el merge, GitHub Actions desplegará `main` en Producción.

## 3. ¿Qué hago con la rama después del primer Merge?

**¡Bórrala!** Es lo más recomendado.

1. Creas rama nueva (`feature/nueva-cosa`).
2. Haces merge a `development`.
3. Borras rama vieja `feature/nueva-cosa`.
4. Repites para la siguiente tarea.

Para borrar tu rama local una vez fusionada (ya no la necesitas):
```bash
git checkout development
git pull origin development         # Asegúrate de tener lo último
git branch -d feature/nombre-viejo
```

PARA MANTENER EL REPOSITORIO LIMPIO (Opcional pero recomendado):
También puedes borrar la rama del servidor (GitLab) para que no se acumulen allí:
```bash
git push origin --delete feature/nombre-viejo
```
*(Nota: Si GitLab ya la borró automáticamente al hacer Merge, este comando te dirá que no existe, lo cual está bien).*


