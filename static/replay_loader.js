$(document).ready(function() {
    // Populate format options from the rendered HTML
    populateFormats();

    defaultReplays();

    // Toggle format selection visibility based on the toggle button

    $('#ratingToggle').on('change', function() {
        $('#ratingValue').toggle(this.checked);
    });

    $('#dateToggle').on('change', function() {
        $('#dateValue').toggle(this.checked);
    });

    // Example: Reload replays when the "Load" button is clicked
    $('#loadButton').on('click', function() {
        loadReplays();
    });

    function populateFormats() {
        // Read available formats from the rendered HTML
        var availableFormats = $('#formatSelect option').map(function() {
            return $(this).val();
        }).get();

        // Populate the format selection dropdown
        var formatSelect = $('#formatSelect');
        formatSelect.empty();
        availableFormats.forEach(function(format) {
            formatSelect.append('<option value="' + format + '">' + format + '</option>');
        });
    }
    function defaultReplays() {
        $('#replays-list').empty();
        $('#loadingText').toggle(true);

        // Make an AJAX request to the Flask endpoint with optional filter parameters
        $.ajax({
            url: '/replay_default',
            method: 'GET',
            data: {
            },
            success: function(data) {
                // Update the frontend with the new replay data
                updateReplays(data);
            },
            error: function(error) {
                console.error('Error fetching replays:', error);
            }
        });

    }
    function loadReplays() {
        $('#replays-list').empty();
        $('#loadingText').toggle(true);

        var pokemonValue = $('#pokemonValue').val();

        var filter_format = $('#formatSelect').val();

        var filter_battleused = $('#usedToggle').is(':checked');

        var filter_rating_enabled = $('#ratingToggle').is(':checked');
        var filter_rating = $('#ratingValue').val();

        var filter_winner = $('#winnerToggle').is(':checked');

        var filter_date_enabled = $('#dateToggle').is(':checked');


        // Make an AJAX request to the Flask endpoint with optional filter parameters
        $.ajax({
            url: '/replay',
            method: 'GET',
            data: {
                pokemon_search: pokemonValue,
                filter_format: filter_format,
                filter_battleused: filter_battleused,
                filter_rating_enabled: filter_rating_enabled,
                filter_rating: filter_rating,
                filter_winner: filter_winner,
            },
            success: function(data) {
                // Update the frontend with the new replay data
                updateReplays(data);
            },
            error: function(error) {
                console.error('Error fetching replays:', error);
            }
        });
    }

    function updateReplays(replays) {
        // Clear the existing list
        $('#replays-list').empty();

        $('#loadingText').toggle(false);

        // Append the new replays to the list
        replays.forEach(function(replay) {
            li_item = '<li>';
            li_item+= '<button class = "team-container" onclick="window.open(\'https://replay.pokemonshowdown.com/'+replay[0]+'\', \'_blank\')" >';

            li_item+= '<div class="grid-item">Rating</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">Player 1</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">Player 2</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">End Score</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">Upload Date</div>';

            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'
            li_item+= '<div class="hl"></div>'

            li_item+= '<div class="grid-item">'+replay[1]+'</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">'+replay[3][0]+'</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">'+replay[3][1]+'</div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item">'+replay[5]+'</div>';
            li_item+= '<div class="vl"></div>'
            var upload_time = new Date(replay[6]*1000);
            li_item+= '<div class="grid-item">'+upload_time.toLocaleDateString("default")+'</div>';
            
            li_item+= '<div class="grid-item"></div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="sprite-container" id = "'+ replay[0] +'"> </div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="sprite-container" id = "'+ replay[0] +'_2">  </div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item"></div>';
            li_item+= '<div class="vl"></div>'
            li_item+= '<div class="grid-item"></div>';

            
            li_item+= '</button>';
            li_item+= '</li>';
            $('#replays-list').append(li_item);

            replay[4][0].forEach(function(index_sprite) {
                createSprite(index_sprite, replay[0]);
            })

            replay[4][1].forEach(function(index_sprite) {
                createSprite(index_sprite, replay[0]+"_2");
            })
        });
    }
    function createSprite(index,elementID) {
        var spriteContainer = document.getElementById(elementID);

        // Create a new div element for the sprite
        var sprite = document.createElement('div');
        sprite.classList.add('sprite');
        
        // Set the background position based on the index
        var columnIndex = index % 12;
        var rowIndex = Math.floor(index / 12);
        sprite.style.backgroundPosition = `-${columnIndex * 40}px -${rowIndex * 30}px`;

        // Append the sprite to the container
        spriteContainer.appendChild(sprite);
     }
});
