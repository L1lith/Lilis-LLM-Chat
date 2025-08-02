import pkg from "../package.json" with {type: 'json'};
import nwbuild from "nw-builder";

nwbuild(pkg.nwbuild);
