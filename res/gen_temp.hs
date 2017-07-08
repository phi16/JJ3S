-- map_temp.out generator

import Codec.Picture
import qualified Data.Vector as V
import Numeric
import Control.Monad
import Control.Lens

hex :: Int -> String
hex x = let
    s = "00" ++ showHex x ""
  in drop (length s-2) s

hex3 :: Int -> String
hex3 x = let
    s = "000" ++ showHex x ""
  in drop (length s-3) s

main :: IO ()
main = do
  s <- map words . lines <$> readFile "map.out"
  let s' = map (init . map (read . ("0o"++) . take 3) . tail) s :: [[Int]]
  let pad = replicate ((64-31)*2) '0'
  iforM_ (map (map hex) s' ) $ \i l -> do
    putStr $ "@" ++ hex3 (i*64) ++ " "
    putStrLn $ concat l
