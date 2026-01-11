# Flujo de Trabajo Git Recomendado (Beta Testing)

Para un entorno de "Beta Testing" donde **`main` es lo que se despliega**, te recomiendo el siguiente flujo simplificado (basado en GitHub/GitLab Flow).

## 1. Ramas (Branches)

*   **`main`**: Es tu rama **sagrada**. Contiene el código que está (o va a estar) en el servidor. Nunca trabajes directamente aquí.
*   **`feature/nombre-tarea`**: Ramas temporales para cada cosa nueva que hagas.

## 2. El Ciclo de Creación

### Paso A: Empezar algo nuevo
Siempre crea una rama desde `main` actualizado:

```bash
git checkout main
git pull origin main       # Actualiza tu main local
git checkout -b feature/nueva-funcionalidad
```

### Paso B: Trabajar
Haces tus cambios, pruebas en tu PC y guardas:

```bash
git add .
git commit -m "Añado nueva funcionalidad X"
```

### Paso C: Subir cambios
Sube tu rama a GitLab:

```bash
git push origin feature/nueva-funcionalidad
```

### Paso D: Fusionar (Merge)
Ve a GitLab y crea un **Merge Request** de tu rama hacia `main`.
*   Revisa que todo esté bien.
*   Dale a **"Merge"**.

## 3. Desplegar en Servidor
Una vez fusionado en GitLab, el cambio ya está en `main` remoto. Ahora vas al servidor:

```bash
ssh usuario@tu-servidor
cd psicoaissist-platform
./deploy.sh
```
*(El script `deploy.sh` hace `git pull origin main` automáticamente)*.

## ¿Por qué así?
1.  **Seguridad**: Si rompes algo, lo rompes en tu rama, no en el servidor.
2.  **Orden**: `main` siempre funciona. Si el servidor falla, sabes que fue el último "Merge".
3.  **Beta Testing**: Puedes tener una rama `beta` si quieres probar antes de `main`, pero para empezar, trabajar con Feature Branches -> Main es lo más ágil.

## 4. ¿Qué hago con la rama después del Merge?

**¡Bórrala!** Es lo más recomendado.

*   **¿Por qué?** Si reutilizas la misma rama `feature/x` para cosas distintas, el historial se ensucia y puedes tener conflictos raros con cosas antiguas.
*   **Lo ideal:** "Una tarea = Una rama".
    1.  Creas rama nueva (`feature/nueva-cosa`).
    2.  Haces merge a `main`.
    3.  Borras rama vieja.
    4.  Repites para la siguiente tarea.

Para borrar tu rama local una vez fusionada (ya no la necesitas):
```bash
git checkout main
git pull origin main         # Asegúrate de tener lo último
git branch -d feature/nombre-viejo
```

PARA MANTENER EL REPOSITORIO LIMPIO (Opcional pero recomendado):
También puedes borrar la rama del servidor (GitLab) para que no se acumulen allí:
```bash
git push origin --delete feature/nombre-viejo
```
*(Nota: Si GitLab ya la borró automáticamente al hacer Merge, este comando te dirá que no existe, lo cual está bien).*


