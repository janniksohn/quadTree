// Import QuadTree classes if not already imported
import { QuadTree, Node, BoundsNode } from "./script.js"

// Initialize the QuadTree
const canvas = document.getElementById('collisionCanvas');
const quadTree = new QuadTree({ x: 0, y: 0, width: canvas.width, height: canvas.height }, true, 6, 10);

const userAmount = document.getElementById("amount");
// Generate random objects for collision testing
let objects = generateRandomObjects(userAmount.value || 100);

userAmount.addEventListener("blur", () => {
    console.log(Math.random() * (canvas.width - 10));
    objects = generateRandomObjects(userAmount.value || 100);
});

// Function to generate random objects
function generateRandomObjects(count) {
    const randomObjects = [];
    for (let i = 0; i < count; i++) {
        const size = 10; // Random size between 10 and 30
        const x = Math.random() * (canvas.width - size);
        const y = Math.random() * (canvas.height - size);
        const speedX = (Math.random() - 0.25) * 1; // Random speed between -1 and 1
        const speedY = (Math.random() - 0.25) * 1; // Random speed between -1 and 1
        randomObjects.push({ x, y, width: size, height: size, speedX, speedY });
    }    
    return randomObjects;
}

// Function to draw objects on the canvas
function drawObjects(context, objects) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'blue';
    for (const obj of objects) {
        context.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
}

// Create a new canvas for displaying Quadtree subdivisions
const subdivisionCanvas = document.createElement('canvas');
subdivisionCanvas.width = canvas.width;
subdivisionCanvas.height = canvas.height;
subdivisionCanvas.classList.add("sub", "hidden")
const hideSub = document.getElementById("hideSubBoundaries")
hideSub.addEventListener("change", function() {
    if (this.checked) {
        subdivisionCanvas.classList.add("hidden");
    } else {
        subdivisionCanvas.classList.remove("hidden");
    }
})
document.body.appendChild(subdivisionCanvas);

// Function to draw Quadtree subdivisions
function drawSubdivisions(context, node) {
    context.strokeStyle = 'gray';
    context.lineWidth = 2;
    context.strokeRect(node._bounds.x, node._bounds.y, node._bounds.width, node._bounds.height);

    for (const subNode of node.nodes) {
        if (subNode) {
            drawSubdivisions(context, subNode);
        }
    }
}

// Function to update the QuadTree and check for collisions
function updateAndCheckCollisions() {
    quadTree.clear();

    // Update object positions and check for collisions
    for (const obj of objects) {
        obj.x += obj.speedX;
        obj.y += obj.speedY;

        // Bounce off the canvas edges
        if (obj.x < 0 || obj.x + obj.width > canvas.width) {
            obj.speedX *= -1;
        }

        if (obj.y < 0 || obj.y + obj.height > canvas.height) {
            obj.speedY *= -1;
        }

        quadTree.insert(obj);
    }

    const context = canvas.getContext('2d');
    const subdivisionContext = subdivisionCanvas.getContext('2d');

    // Clear subdivision canvas
    subdivisionContext.clearRect(0, 0, subdivisionCanvas.width, subdivisionCanvas.height);

    drawSubdivisions(subdivisionContext, quadTree.root);

    drawObjects(context, objects);

    for (const obj of objects) {
        const potentialColliders = quadTree.retrieve(obj);
        for (const collider of potentialColliders) {
            if (obj !== collider && areColliding(obj, collider)) {
                // Handle collision (e.g., change color, log collision, etc.)
                context.fillStyle = 'red';
                context.fillRect(obj.x, obj.y, obj.width, obj.height);
            }
        }
    }

    requestAnimationFrame(updateAndCheckCollisions);
}

function areColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

for (const obj of objects) {
    obj.speedX = (Math.random() - 0.25) * 1; // Random speed between -1 and 1
    obj.speedY = (Math.random() - 0.25) * 1; // Random speed between -1 and 1
}

updateAndCheckCollisions()
