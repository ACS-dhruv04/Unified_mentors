document.addEventListener("DOMContentLoaded", function() {
  const story = {
    start: {
      text: "You stand before the legendary Whispering Woods, the morning sun painting the trees gold. To your right is a path to a bustling market; ahead the forest beckons. Where will you begin your adventure?",
      choices: [
        { text: "Enter the forest", next: "forest_clearing" },
        { text: "Go to the market", next: "market_scene" }
      ]
    },
    market_scene: {
      text: "The market hums with activity. A merchant offers you a strange map, while a street performer catches your eye. What do you do?",
      choices: [
        { text: "Buy the map", next: "buy_map" },
        { text: "Watch the performer", next: "street_performer" }
      ]
    },
    buy_map: {
      text: "The map leads you to a hidden path in the woods. You soon find yourself facing the entrance of a mysterious cave.",
      choices: [
        { text: "Enter the cave", next: "cave_scene" },
        { text: "Return to the market", next: "market_scene" }
      ]
    },
    street_performer: {
      text: "The performer juggles flaming torches, then hands you a small, glowing stone. It feels warm to the touch.",
      choices: [
        { text: "Thank the performer and head to the woods", next: "forest_clearing" }
      ]
    },
    forest_clearing: {
      text: "Deep in the forest, you reach a sunlit clearing. Butterflies flit above wildflowers, and two paths spread out before you.",
      choices: [
        { text: "Follow the river", next: "river_path" },
        { text: "Climb the rocky hill", next: "hill_path" }
      ]
    },
    river_path: {
      text: "The river rushes over smooth stones. A boat tied to a willow floats gently against the bank.",
      choices: [
        { text: "Take the boat", next: "boat_scene" },
        { text: "Continue on foot", next: "forest_end" }
      ]
    },
    boat_scene: {
      text: "As you gently paddle downstream, you spot an old castle on the riverbank, its towers lost in mist.",
      choices: [
        { text: "Dock at the castle", next: "castle_scene" },
        { text: "Keep floating", next: "river_end" }
      ]
    },
    forest_end: {
      text: "Birds scatter from the trees as you reach the edge of the woods, your heart full of strange new memories. Congratulations, you've finished one adventure!",
      choices: [
        { text: "Restart Adventure", next: "start" }
      ]
    },
    castle_scene: {
      text: "Within the castle's great hall, a banquet awaits. The host reveals themselves as the enchanted guardian of the woods, rewarding your curiosity.",
      choices: [
        { text: "Thank the guardian and return home", next: "forest_end" }
      ]
    },
    river_end: {
      text: "Your boat glides into morning mist. A sense of peace settles over you as your journey fades to legend.",
      choices: [
        { text: "Restart Adventure", next: "start" }
      ]
    },
    cave_scene: {
      text: "Inside the cave, ancient markings glow with a faint blue light. A hidden chamber promises secrets.",
      choices: [
        { text: "Explore the chamber", next: "cave_treasure" },
        { text: "Leave the cave", next: "forest_clearing" }
      ]
    },
    cave_treasure: {
      text: "You discover a chest brimming with gold and a map for new journeys.",
      choices: [
        { text: "Begin a new journey", next: "start" }
      ]
    },
    hill_path: {
      text: "Atop the rocky hill, the valley stretches out under a vast sky. You feel a sense of wonder and accomplishment.",
      choices: [
        { text: "Descend to the market", next: "market_scene" }
      ]
    }
  };

  const storyText = document.getElementById('story-text');
  const choicesDiv = document.getElementById('choices');
  const restartBtn = document.getElementById('restart');

  function renderScene(sceneKey) {
    const scene = story[sceneKey];
    storyText.textContent = scene.text;
    choicesDiv.innerHTML = '';
    scene.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.onclick = () => renderScene(choice.next);
      choicesDiv.appendChild(btn);
    });
    restartBtn.style.display = sceneKey !== 'start' ? 'block' : 'none';
    restartBtn.onclick = () => renderScene('start');
  }

  renderScene('start');
});
