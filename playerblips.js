"use strict";
/// <reference path="types-gtanetwork/index.d.ts" />
var g_hashRhino = API.getHashKey("rhino");
var g_hashInsurgent = API.getHashKey("insurgent");
var g_hashTechnical = API.getHashKey("technical");
var g_hashHydra = API.getHashKey("hydra");
var g_hashLazer = API.getHashKey("lazer");
function updatePlayerBlip(blip, player) {
    if (blip == null || blip.IsNull) {
        return;
    }
    var playerPosition = API.getEntityPosition(player);
    var playerRotation = API.getEntityRotation(player);
    API.setBlipPosition(blip, playerPosition);
    API.callNative("SET_BLIP_ROTATION", blip, Math.round(playerRotation.Z));
}
API.onUpdate.connect(function () {
    var players = API.getStreamedPlayers();
    for (var i = 0; i < players.Length; i++) {
        var player = players[i];
        // WORKAROUND: Ignore if position is reported to be at 0,0,0 exactly.
        // Bug reported here: https://forum.gtanet.work/index.php?threads/streaming-entities-api-functions-dont-stream-out.1468/
        var zeroCheck = API.getEntityPosition(player);
        if (zeroCheck.X == 0 && zeroCheck.Y == 0 && zeroCheck.Z == 0) {
            continue;
        }
        var blip = API.getEntitySyncedData(player, "playerblip");
        if (blip == null || blip.IsNull) {
            continue;
        }
        updatePlayerBlip(blip, player);
    }
    var localPlayer = API.getLocalPlayer();
    var localPosition = API.getEntityPosition(localPlayer);
    var localRotation = API.getEntityRotation(localPlayer);
    var localVehicle = API.getPlayerVehicle(localPlayer);
    var localBlip = API.getEntitySyncedData(localPlayer, "playerblip");
    if (localBlip == null) {
        return;
    }
    API.setBlipTransparency(localBlip, 0);
    //var localBlipColor = API.getBlipColor(localBlip); // For testing
    var localBlipSprite = API.getBlipSprite(localBlip);
    var newBlipSprite = localBlipSprite;
    updatePlayerBlip(localBlip, localPlayer);
    if (localVehicle.IsNull) {
        newBlipSprite = 1;
    }
    else {
        var vehicleHash = API.getEntityModel(localVehicle);
        if (vehicleHash == g_hashRhino) {
            newBlipSprite = 421;
        }
        else if (vehicleHash == g_hashInsurgent || vehicleHash == g_hashTechnical) {
            newBlipSprite = 460;
        }
        else if (vehicleHash == g_hashHydra || vehicleHash == g_hashLazer) {
            newBlipSprite = 16;
        }
        else {
            newBlipSprite = 1;
        }
    }
    if (localBlipSprite != newBlipSprite) {
        API.setBlipSprite(localBlip, newBlipSprite);
        //API.setBlipColor(localBlip, localBlipColor); // For testing
        API.triggerServerEvent("playerblip_sprite", newBlipSprite);
    }
});
