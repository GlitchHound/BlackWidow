<?php
/*************************************

	BlackWidow is a command-based interface for a social network.
    Copyright © 2012 Bilawal Hameed, Alejandro Sauze Saucedo, Charlie Brensinger, Anton Smyrnov, Sari Ghamloush

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*************************************/


// These are the data items sent via the JS engine.
// command_text would show the string entered in the console i.e. 'cd /website'
// command_time would show the time it was sent by the browser (compare against time() to see any lag)
// command_version would show the version the JS engine is (for compatibility)
$command_text = $_GET['HTTP_X_BW_COMMAND'];
$command_time = $_GET['HTTP_X_BW_TIMESTAMP'];
$command_version = $_GET['HTTP_X_BW_VERSION'];

echo "The command you sent to the server was '". $command_text ."'";