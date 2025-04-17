$(document).ready(function() {
    // Populate format options from the rendered HTML
    populateFormats();

    defaultReplays();

    // Toggle format selection visibility based on the toggle button

    $('#ratingToggle').on('change', function() {
        $('#ratingValue').toggle(this.checked);
    });

    $('#usageScoreToggle').on('change', function() {
        $('#usageScoreValue').toggle(this.checked);
        $('#usageScoreExplained').toggle(this.checked);
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
                $('#errorText').toggle(true);
                $('#loadingText').toggle(false);
            }
        });

    }
    function loadReplays() {
        $('#replays-list').empty();
        $('#loadingText').toggle(true);
        $('#errorText').toggle(false);
        $('#noReplaysText').toggle(false);

        var pokemonValue = $('#pokemonValue').val();

        var filter_format = $('#formatSelect').val();

        var filter_battleused = $('#usedToggle').is(':checked');

        var filter_rating_enabled = $('#ratingToggle').is(':checked');
        var filter_rating = $('#ratingValue').val();

        var filter_usage_score_enabled = $('#usageScoreToggle').is(':checked');
        var filter_usage_score = $('#usageScoreValue').val();

        var filter_winner = $('#winnerToggle').is(':checked');


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
                filter_usage_score_enabled: filter_usage_score_enabled,
                filter_usage_score: filter_usage_score,
                filter_winner: filter_winner,
            },
            success: function(data) {
                // Update the frontend with the new replay data
                updateReplays(data);
            },
            error: function(error) {
                console.error('Error fetching replays:', error);
                $('#errorText').toggle(true);
                $('#loadingText').toggle(false);
            }
        });
    }

    function updateReplays(replays) {
        // Clear the existing list
        $('#replays-list').empty();

        $('#loadingText').toggle(false);

        // Append the new replays to the list
        if (replays.length < 1) {
            $('#noReplaysText').toggle(true);
        }
        replays.forEach(function(replay) {
            var bo3 = replay[9].includes("Bo3");
            li_item = '<li>';
            if (bo3) {
                li_item+= '<div class = "team-container">';
            } else {
                li_item+= '<button class = "team-container" onclick="window.open(\'https://replay.pokemonshowdown.com/'+replay[0]+'\', \'_blank\')">';
            }

            li_item+= '<div class="grid-item">Rating</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">Player 1</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">Player 2</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">End Score</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">Upload Date</div>';
            if (bo3) {
                li_item+= '<div class="vl"></div>';
                li_item+= '<div class="grid-item">Best-of-3 Replays</div>';
            } else {
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
            }

            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            li_item+= '<div class="hl"></div>';
            if (bo3) {
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
            } else {
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
            }
            

            li_item+= '<div class="grid-item">'+replay[1]+'</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">'+replay[3][0]+'</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">'+replay[3][1]+'</div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item">'+replay[5]+'</div>';
            li_item+= '<div class="vl"></div>';
            var upload_time = new Date(replay[6]*1000);
            li_item+= '<div class="grid-item">'+upload_time.toLocaleDateString("default")+'</div>';

            if (bo3) {
                li_item+= '<div class="vl"></div>';
                li_item+= '<div class="grid-item"></div>';
            } else {
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
            }

            li_item+= '<div class="grid-item"></div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="sprite-container" id = "'+ replay[0] +'"> </div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="sprite-container" id = "'+ replay[0] +'_2">  </div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item"></div>';
            li_item+= '<div class="vl"></div>';
            li_item+= '<div class="grid-item"></div>';
            if (bo3) {
                li_item+= '<div class="vl"></div>';
                li_item+= '<div class="grid-item">';
                if (replay[8][0]!="") {
                    li_item+='<button style="margin:0px" onclick="window.open(\'https://replay.pokemonshowdown.com/'+replay[8][0]+'\', \'_blank\')"> Game 1 </button>' ;
                } else {
                    li_item+='<button class="noHover" style="margin:0px; background-color:#444444"><s> Game 1 </s></button>' ;
                }
                if (replay[8][1]!="") {
                    li_item+='<button style="margin:0px" onclick="window.open(\'https://replay.pokemonshowdown.com/'+replay[8][1]+'\', \'_blank\')"> Game 2 </button>' ;
                } else {
                    li_item+='<button class="noHover" style="margin:0px; background-color:#444444"><s> Game 2 </s></button>' ;
                }
                if (replay[8][2]!="") {
                    li_item+='<button style="margin:0px" onclick="window.open(\'https://replay.pokemonshowdown.com/'+replay[8][2]+'\', \'_blank\')"> Game 3 </button>' ;
                } else {
                    li_item+='<button class="noHover" style="margin:0px; background-color:#444444"><s> Game 3 </s></button>' ;
                }
                
                li_item+='</div>';
            } else {
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
                li_item+= '<div class="grid-item" style="padding:0px"></div>';
            }
            if ($('#usageScoreToggle').is(':checked') === true) {
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                li_item+= '<div class="hl"></div>';
                if (bo3) {
                    li_item+= '<div class="hl"></div>';
                    li_item+= '<div class="hl"></div>';
                } else {
                    li_item+= '<div class="grid-item" style="padding:0px"></div>';
                    li_item+= '<div class="grid-item" style="padding:0px"></div>';
                }

                li_item+= '<div class="grid-item"></div>';
                li_item+= '<div class="vl"></div>';
                li_item+= '<div class="grid-item">Usage Score: '+ parseFloat(replay[7][0]).toFixed(2)+'</div>';
                li_item+= '<div class="vl"></div>'
                li_item+= '<div class="grid-item">Usage Score: '+ parseFloat(replay[7][1]).toFixed(2)+'</div>';
                li_item+= '<div class="vl"></div>';
                li_item+= '<div class="grid-item"></div>';
                li_item+= '<div class="vl"></div>';
                li_item+= '<div class="grid-item"></div>';
                if (bo3) {
                    li_item+= '<div class="vl"></div>';
                    li_item+= '<div class="grid-item"></div>';
                } else {
                    li_item+= '<div class="grid-item" style="padding:0px"></div>';
                    li_item+= '<div class="grid-item" style="padding:0px"></div>';
                }
            }
            

            if (bo3) {
                li_item+= '</div>';
            } else {
                li_item+= '</button>';
            }
            
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
