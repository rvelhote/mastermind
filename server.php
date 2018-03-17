<?php

ini_set('error_reporting', -1);
ini_set('display_errors', 1);

$request = json_decode(file_get_contents('php://input'));


$db = new PDO('sqlite:mastermind.sqlite');
$db->exec("CREATE TABLE IF NOT EXISTS peer (peerId TEXT PRIMARY KEY, status INTEGER)");

if($request->action === 'peer-new') {
    $peerId = trim(mb_strtolower(strip_tags($request->peerId)));
    $status = 0;

    $stmt = $db->prepare('INSERT INTO peer (peerId, status) VALUES (:peerId, :status)');
    $stmt->bindValue(':peerId', $peerId);
    $stmt->bindValue(':status', $status);
    $stmt->execute();
}

if($request->action === 'peer-update-status') {

}