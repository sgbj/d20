import "./style.css";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  Vector3,
  Mesh,
  MeshBuilder,
  HavokPlugin,
  FreeCamera,
  PhysicsAggregate,
  PhysicsShapeType,
  Camera,
  Color4,
  SceneLoader,
  PhysicsViewer,
  HemisphericLight,
  ScenePerformancePriority,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

async function main() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);
  scene.performancePriority = ScenePerformancePriority.Aggressive;

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  scene.createDefaultEnvironment({ createGround: false, createSkybox: false });

  const camera = new FreeCamera("camera", new Vector3(0, 10, 0), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);

  const box = MeshBuilder.CreateBox(
    "box",
    { width: 1, height: 5, depth: 1, sideOrientation: Mesh.BACKSIDE },
    scene
  );
  box.isVisible = false;

  resize();

  const boxAggregate = new PhysicsAggregate(
    box,
    PhysicsShapeType.MESH,
    { mass: 0, friction: 0.75 },
    scene
  );

  async function loadDie(name: string) {
    const res = await SceneLoader.ImportMeshAsync("", "/", name);
    const newMesh = Mesh.MergeMeshes(
      res.meshes.slice(1) as Mesh[],
      true,
      true,
      undefined,
      true,
      true
    )!;
    newMesh?.scaling.scaleInPlace(0.04);
    const d20Aggregate = new PhysicsAggregate(
      newMesh,
      PhysicsShapeType.CONVEX_HULL,
      { mass: 1, restitution: 0.1, friction: 0.7 },
      scene
    );

    d20Aggregate.body.setAngularVelocity(new Vector3(rng(), rng(), rng()));

    d20Aggregate.body.applyImpulse(
      new Vector3(rng(), rng(), rng()),
      new Vector3(rng(), rng(), rng())
    );
  }

  function rng() {
    return (25 + Math.random() * 25) * (Math.random() > 0.5 ? 1 : -1);
  }

  await loadDie("D4.glb");
  await loadDie("D6.glb");
  await loadDie("D8.glb");
  await loadDie("D10.glb");
  await loadDie("D12.glb");
  await loadDie("D20.glb");

  const physicsViewer = new PhysicsViewer();
  //physicsViewer.showBody(d20Aggregate.body);

  engine.runRenderLoop(() => {
    scene.render();
  });
  console.log(scene.meshes);

  window.addEventListener("resize", resize);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const orthoWidthValue = canvas.width / 100;
    const orthoHeightValue = canvas.height / 100;

    camera.orthoBottom = -orthoHeightValue;
    camera.orthoTop = orthoHeightValue;
    camera.orthoLeft = -orthoWidthValue;
    camera.orthoRight = orthoWidthValue;

    box.scaling = new Vector3(orthoWidthValue * 2, 2, orthoHeightValue * 2);

    engine.resize();
  }
}

main();
