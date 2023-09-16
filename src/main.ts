import "./style.css";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  HavokPlugin,
  FreeCamera,
  PhysicsAggregate,
  PhysicsShapeType,
  Camera,
  Color4,
  SceneLoader,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

async function main() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);

  const camera = new FreeCamera("camera", new Vector3(0, 20, 0), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

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

  await SceneLoader.AppendAsync("/", "scene.gltf");

  scene.meshes[2].scaling.scaleInPlace(30);

  const d20Aggregate = new PhysicsAggregate(
    scene.meshes[2],
    PhysicsShapeType.MESH,
    { mass: 1, restitution: 0.3, friction: 0.75 },
    scene
  );

  const rng = () => (10 + Math.random() * 20) * (Math.random() > 0.5 ? 1 : -1);
  d20Aggregate.body.setAngularVelocity(new Vector3(rng(), rng(), rng()));

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", resize);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const orthoWidthValue = canvas.width / 125;
    const orthoHeightValue = canvas.height / 125;

    camera.orthoBottom = -orthoHeightValue;
    camera.orthoTop = orthoHeightValue;
    camera.orthoLeft = -orthoWidthValue;
    camera.orthoRight = orthoWidthValue;

    box.scaling = new Vector3(orthoWidthValue * 2, 1, orthoHeightValue * 2);

    engine.resize();
  }
}

main();
