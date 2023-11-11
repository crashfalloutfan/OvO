(function () {
    const old = globalThis.sdk_runtime;
    c2_callFunction("execCode", ["globalThis.sdk_runtime = this.runtime"]);
    const runtime = globalThis.sdk_runtime;
    globalThis.sdk_runtime = old;

    const getPlayer = () => {
        return runtime.types_by_index
            .filter(
                (x) =>
                    !!x.animations &&
                    x.animations[0].frames[0].texture_file.includes("collider")
            )[0]
            .instances.filter(
                (x) => x.instance_vars[17] === "" && x.behavior_insts[0].enabled
            )[0];
    }

    const getLayer = () => {
        return runtime.running_layout.layers.find(x => x.name === "Layer 0");
    }

    const createCamera = (x, y) => {
        const spriteType = runtime.types_by_index.find(x => x.plugin instanceof cr.plugins_.Sprite && x.all_frames && x.all_frames[0].texture_file.includes("camera"));

        const sprite = runtime.createInstance(spriteType, getLayer(), x, y);
        sprite.set_bbox_changed();
        return sprite;
    }

    const notify = (title, text, image = "./speedrunner.png") => {
        cr.plugins_.sirg_notifications.prototype.acts.AddSimpleNotification.call(
            runtime.types_by_index.find(
                (type) => type.plugin instanceof cr.plugins_.sirg_notifications
            ).instances[0],
            title,
            text,
            image
        );
    };

    const freecamMod = {
        init() {
            this.activated = false;
            this.camera = null;

            document.addEventListener("keypress", (event) => { this.keyPress(event) });

            runtime.tickMe(this);

            globalThis.ovoFreecamMod = this;
        },

        keyPress(event) {
            if (event.key == "Q") {
                this.activated = !this.activated;
                if (this.activated) this.startActivation();
                notify("Freecam Mod", `Camera Override ${this.activated ? "Enabled" : "Disabled"}`);
            }
        },

        startActivation() {
            this.player = getPlayer();

            if (!this.camera) {
                this.camera = createCamera(this.player.x, this.player.y);
            }
        },

        tick() {
            const layer = getLayer();

            if (!layer.instances.includes(this.camera)) {
                this.camera = null;
                this.activated = false;
            }

            if (!this.activated && this.camera) {
                this.camera.x = this.player.x;
                this.camera.y = this.player.y;
            }
        }
    };

    freecamMod.init();
})();