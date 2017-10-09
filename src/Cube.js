import React, {Component} from 'react';
import './Cube.css';

class Cube extends Component {
    static get directions() {
        return ["x", "y"];
    }

    static get sizes() {
        return {
            xs: 15,
            s: 25,
            m: 40,
            l: 100,
            xl: 120,
        };
    }

    componentDidMount() {
        this.init();
        this.renderTick();
    }

    _setState(state, speed) {
        Cube.directions.forEach(axis => {
            state[axis] += speed[axis];
            if (Math.abs(state[axis]) < 360) return;
            const max = Math.max(state[axis], 360);
            const min = max === 360 ? Math.abs(state[axis]) : 360;
            state[axis] = max - min;
        });
    }

    get cubeStyle() {
        return this.cube && {
            width: `${this.cube.size}px`,
            height: `${this.cube.size}px`,
        };
    }

    get shadowStyle() {
        return this.cube && {
            filter: `blur(${Math.round(this.cube.size * .4)}px)`,
            opacity: Math.min(this.cube.size / 120, .4),
        };
    }

    random(e, t) {
        return Math.random() * (t - e) + e;
    }

    interpolate(a, b, i) {
        return a * (1 - i) + b * i;
    }

    distanceFrom(state, rotate) {
        return Cube.directions.reduce((object, axis) => {
            object[axis] = Math.abs(state[axis] + rotate[axis]);
            return object;
        }, {});
    }

    rotationFrom(state, size, rotate) {
        const axis = rotate.x ? "Z" : "Y";
        const direction = rotate.x > 0 ? -1 : 1;

        return `
            rotateX(${state.x + rotate.x}deg)
            rotate${axis}(${direction * (state.y + rotate.y)}deg)
            translateZ(${size / 2}px)
        `;
    };

    shadingFrom(tint, rotate, distance) {
        const darken = Cube.directions.reduce((object, axis) => {
            const delta = distance[axis];
            const ratio = delta / 180;
            object[axis] = delta > 180 ? Math.abs(2 - ratio) : ratio;
            return object;
        }, {});

        if (rotate.x)
            darken.y = 0;
        else {
            const {x} = distance;
            if (x > 90 && x < 270)
                Cube.directions.forEach(axis => darken[axis] = 1 - darken[axis]);
        }

        const alpha = (darken.x + darken.y) / 2;
        const blend = (value, index) =>
            Math.round(this.interpolate(value, tint.shading[index], alpha));

        const [r, g, b] = tint.color.map(blend);
        return `rgb(${r}, ${g}, ${b})`;
    };

    shouldHideFrom(rotateX, x, y) {
        if (rotateX)
            return x > 90 && x < 270;
        if (x < 90)
            return y > 90 && y < 270;
        if (x < 270)
            return y < 90;
        return y > 90 && y < 270;
    };

    renderSidesWith({state, speed, size, tint, sides}) {
        const animate = object => {
            const {side, rotate, hidden} = object;
            const distance = this.distanceFrom(state, rotate);

            // don't animate hidden sides
            if (this.shouldHideFrom(rotate.x, distance.x, distance.y)) {
                if (!hidden) {
                    side.hidden = true;
                    object.hidden = true;
                }
                return;
            }

            if (hidden) {
                side.hidden = false;
                object.hidden = false;
            }

            side.style.transform = this.rotationFrom(state, size, rotate);
            side.style.backgroundColor = this.shadingFrom(tint, rotate, distance);
        };

        this._setState(state, speed);
        sides.forEach(animate);
    };

    init() {
        this.cube = {
            tint: {
                color: [255, 255, 255],
                shading: [133, 133, 133],
            },
            size: Cube.sizes.s,
            left: 35,
            top: 465,
        };

        const state = {
            x: 0,
            y: 0,
        };

        const speed = Cube.directions.reduce((object, axis) => {
            const max = this.cube.size > Cube.sizes.m ? .3 : .6;
            object[axis] = this.random(-max, max);
            return object;
        }, {});

        const sides = [...this.cubeSides.children].reduce((object, side) => {
            object[side.className] = {
                side,
                hidden: false,
                rotate: {
                    x: 0,
                    y: 0,
                },
            };
            return object;
        }, {});

        sides.top.rotate.x = 90;
        sides.bottom.rotate.x = -90;
        sides.left.rotate.y = -90;
        sides.right.rotate.y = 90;
        sides.back.rotate.y = -180;

        // this.cube.domElement = this.cubeElement;
        this.cube.state = state;
        this.cube.speed = speed;
        this.cube.sides = Object.values(sides);

        this.forceUpdate();
    }

    renderTick() {
        this.renderSidesWith(this.cube);
        requestAnimationFrame(this.renderTick.bind(this));
    };

    render() {
        return (
            <div
                className="cube"
                ref={(component) => this.cubeElement = component}
                style={this.cubeStyle}
                onClick={this.props.handleAction}
            >
                <div
                    className="shadow"
                    style={this.shadowStyle}
                />
                <div className="sides" ref={(component) => this.cubeSides = component}>
                    <div className="back">?</div>
                    <div className="top">?</div>
                    <div className="left">?</div>
                    <div className="front">?</div>
                    <div className="right">?</div>
                    <div className="bottom">?</div>
                </div>
            </div>
        );
    }
}

export default Cube;
