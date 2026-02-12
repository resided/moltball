-- ============================================
-- PREMIER LEAGUE 2024-25 SEED DATA
-- ============================================

-- First, clear existing players (optional - remove if you want to keep existing)
-- TRUNCATE TABLE players CASCADE;

-- Insert Premier League Players with realistic stats
INSERT INTO players (name, position, team_real, overall_rating, pace, shooting, passing, dribbling, defending, physicality, price_ball, total_shares, available_shares, rarity) VALUES

-- ARSENAL
('Bukayo Saka', 'RW', 'Arsenal', 87, 85, 82, 83, 88, 64, 75, 8500, 1000, 1000, 'premium'),
('Martin Ødegaard', 'CAM', 'Arsenal', 87, 76, 80, 90, 88, 62, 68, 8200, 1000, 1000, 'premium'),
('Declan Rice', 'CDM', 'Arsenal', 86, 78, 70, 82, 78, 85, 84, 8000, 1000, 1000, 'premium'),
('William Saliba', 'CB', 'Arsenal', 85, 78, 45, 68, 72, 87, 84, 7500, 1000, 1000, 'gold'),
('Gabriel Martinelli', 'LW', 'Arsenal', 84, 90, 78, 75, 85, 40, 72, 6800, 1000, 1000, 'gold'),
('Gabriel Jesus', 'ST', 'Arsenal', 83, 82, 82, 76, 86, 45, 78, 6500, 1000, 1000, 'gold'),
('Ben White', 'RB', 'Arsenal', 82, 76, 50, 75, 74, 80, 78, 5800, 1000, 1000, 'gold'),
('Kai Havertz', 'CF', 'Arsenal', 82, 75, 78, 80, 82, 55, 78, 5600, 1000, 1000, 'gold'),
('Gabriel Magalhães', 'CB', 'Arsenal', 84, 72, 45, 65, 68, 86, 88, 6200, 1000, 1000, 'gold'),
('David Raya', 'GK', 'Arsenal', 84, 55, 45, 70, 65, 45, 78, 6000, 1000, 1000, 'gold'),

-- ASTON VILLA
('Ollie Watkins', 'ST', 'Aston Villa', 84, 88, 84, 76, 82, 45, 78, 6500, 1000, 1000, 'gold'),
('Douglas Luiz', 'CM', 'Aston Villa', 83, 72, 78, 82, 80, 76, 80, 5800, 1000, 1000, 'gold'),
('Emiliano Martínez', 'GK', 'Aston Villa', 85, 52, 48, 72, 70, 48, 82, 6800, 1000, 1000, 'gold'),
('John McGinn', 'CM', 'Aston Villa', 81, 74, 76, 80, 78, 76, 84, 5200, 1000, 1000, 'gold'),
('Ezri Konsa', 'CB', 'Aston Villa', 80, 76, 45, 68, 70, 82, 80, 4800, 1000, 1000, 'gold'),

-- BOURNEMOUTH
('Dominic Solanke', 'ST', 'Bournemouth', 79, 78, 80, 72, 78, 40, 78, 4200, 1000, 1000, 'silver'),
('Philip Billing', 'CM', 'Bournemouth', 78, 72, 76, 78, 76, 74, 84, 3800, 1000, 1000, 'silver'),

-- BRENTFORD
('Ivan Toney', 'ST', 'Brentford', 82, 78, 84, 74, 80, 45, 86, 5500, 1000, 1000, 'gold'),
('Bryan Mbeumo', 'RW', 'Brentford', 80, 84, 78, 76, 82, 45, 74, 4800, 1000, 1000, 'gold'),
('Yoane Wissa', 'LW', 'Brentford', 78, 86, 76, 74, 82, 40, 72, 4000, 1000, 1000, 'silver'),

-- BRIGHTON
('Kaoru Mitoma', 'LW', 'Brighton', 82, 88, 78, 76, 88, 42, 70, 5400, 1000, 1000, 'gold'),
('Moisés Caicedo', 'CDM', 'Brighton', 84, 78, 68, 78, 80, 84, 84, 6800, 1000, 1000, 'gold'),
('Solly March', 'RW', 'Brighton', 79, 84, 76, 76, 84, 50, 72, 4200, 1000, 1000, 'silver'),
('Lewis Dunk', 'CB', 'Brighton', 81, 62, 55, 76, 72, 82, 84, 4600, 1000, 1000, 'gold'),

-- BURNLEY
('Lyle Foster', 'ST', 'Burnley', 75, 80, 74, 68, 76, 38, 76, 2800, 1000, 1000, 'silver'),
('James Trafford', 'GK', 'Burnley', 76, 55, 45, 65, 62, 42, 76, 3000, 1000, 1000, 'silver'),

-- CHELSEA
('Enzo Fernández', 'CM', 'Chelsea', 85, 76, 76, 88, 86, 78, 78, 7200, 1000, 1000, 'premium'),
('Cole Palmer', 'RW', 'Chelsea', 86, 82, 84, 85, 88, 48, 72, 7800, 1000, 1000, 'premium'),
('Conor Gallagher', 'CM', 'Chelsea', 81, 78, 76, 80, 82, 76, 82, 5200, 1000, 1000, 'gold'),
('Reece James', 'RB', 'Chelsea', 84, 82, 68, 80, 82, 82, 82, 6500, 1000, 1000, 'gold'),
('Nicolas Jackson', 'ST', 'Chelsea', 80, 88, 80, 72, 82, 40, 82, 4800, 1000, 1000, 'gold'),
('Mykhailo Mudryk', 'LW', 'Chelsea', 79, 94, 76, 74, 86, 38, 68, 4400, 1000, 1000, 'silver'),
('Thiago Silva', 'CB', 'Chelsea', 83, 55, 60, 78, 72, 86, 78, 5600, 1000, 1000, 'gold'),
('Robert Sánchez', 'GK', 'Chelsea', 80, 58, 45, 68, 65, 42, 80, 4600, 1000, 1000, 'gold'),

-- CRYSTAL PALACE
('Eberechi Eze', 'CAM', 'Crystal Palace', 81, 78, 78, 80, 86, 48, 76, 5000, 1000, 1000, 'gold'),
('Marc Guéhi', 'CB', 'Crystal Palace', 80, 74, 45, 68, 70, 82, 80, 4600, 1000, 1000, 'gold'),
('Michael Olise', 'RW', 'Crystal Palace', 80, 82, 78, 82, 88, 45, 72, 4800, 1000, 1000, 'gold'),
('Joachim Andersen', 'CB', 'Crystal Palace', 79, 65, 55, 74, 70, 80, 82, 4200, 1000, 1000, 'silver'),

-- EVERTON
('Jordan Pickford', 'GK', 'Everton', 82, 55, 50, 72, 68, 45, 78, 5000, 1000, 1000, 'gold'),
('Amadou Onana', 'CDM', 'Everton', 80, 76, 68, 74, 76, 80, 86, 4600, 1000, 1000, 'gold'),
('Dominic Calvert-Lewin', 'ST', 'Everton', 78, 76, 78, 70, 76, 48, 80, 3800, 1000, 1000, 'silver'),
('Jarrad Branthwaite', 'CB', 'Everton', 78, 74, 50, 68, 70, 80, 82, 4000, 1000, 1000, 'silver'),

-- FULHAM
('Andreas Pereira', 'CAM', 'Fulham', 79, 74, 78, 82, 84, 55, 70, 4200, 1000, 1000, 'silver'),
('João Palhinha', 'CDM', 'Fulham', 82, 68, 72, 76, 74, 86, 88, 5200, 1000, 1000, 'gold'),
('Willian', 'LW', 'Fulham', 77, 72, 76, 80, 84, 42, 65, 3400, 1000, 1000, 'silver'),

-- LIVERPOOL
('Mohamed Salah', 'RW', 'Liverpool', 89, 88, 88, 82, 90, 45, 75, 9500, 1000, 1000, 'premium'),
('Virgil van Dijk', 'CB', 'Liverpool', 88, 72, 60, 78, 72, 90, 86, 9000, 1000, 1000, 'premium'),
('Alisson Becker', 'GK', 'Liverpool', 88, 58, 50, 78, 75, 50, 84, 8800, 1000, 1000, 'premium'),
('Trent Alexander-Arnold', 'RB', 'Liverpool', 86, 78, 78, 92, 86, 78, 78, 7800, 1000, 1000, 'premium'),
('Darwin Núñez', 'ST', 'Liverpool', 84, 90, 84, 74, 82, 45, 86, 7200, 1000, 1000, 'gold'),
('Luis Díaz', 'LW', 'Liverpool', 85, 90, 80, 78, 88, 45, 76, 7500, 1000, 1000, 'gold'),
('Alexis Mac Allister', 'CM', 'Liverpool', 84, 76, 78, 84, 86, 76, 76, 6800, 1000, 1000, 'gold'),
('Dominik Szoboszlai', 'CM', 'Liverpool', 83, 80, 78, 82, 86, 72, 78, 6400, 1000, 1000, 'gold'),
('Andrew Robertson', 'LB', 'Liverpool', 84, 80, 62, 84, 80, 82, 80, 6600, 1000, 1000, 'gold'),
('Ibrahima Konaté', 'CB', 'Liverpool', 84, 78, 48, 72, 70, 86, 88, 6200, 1000, 1000, 'gold'),

-- LUTON TOWN
('Ross Barkley', 'CM', 'Luton Town', 76, 72, 74, 78, 80, 68, 78, 3000, 1000, 1000, 'silver'),
('Elijah Adebayo', 'ST', 'Luton Town', 75, 78, 76, 68, 74, 42, 82, 2800, 1000, 1000, 'silver'),

-- MANCHESTER CITY
('Erling Haaland', 'ST', 'Manchester City', 91, 89, 94, 65, 80, 45, 88, 12000, 1000, 1000, 'icon'),
('Kevin De Bruyne', 'CAM', 'Manchester City', 91, 76, 86, 93, 87, 64, 78, 11500, 1000, 1000, 'icon'),
('Rodri', 'CDM', 'Manchester City', 89, 72, 76, 86, 82, 88, 86, 9200, 1000, 1000, 'premium'),
('Phil Foden', 'RW', 'Manchester City', 87, 84, 84, 86, 90, 58, 72, 8200, 1000, 1000, 'premium'),
('Bernardo Silva', 'CM', 'Manchester City', 88, 82, 78, 88, 94, 76, 72, 8500, 1000, 1000, 'premium'),
('Julián Álvarez', 'CF', 'Manchester City', 85, 82, 84, 80, 86, 55, 76, 7200, 1000, 1000, 'gold'),
('Rúben Dias', 'CB', 'Manchester City', 88, 72, 52, 76, 72, 88, 88, 8400, 1000, 1000, 'premium'),
('Ederson', 'GK', 'Manchester City', 87, 62, 52, 85, 82, 52, 82, 8000, 1000, 1000, 'premium'),
('Kyle Walker', 'RB', 'Manchester City', 85, 92, 62, 78, 78, 82, 84, 7200, 1000, 1000, 'gold'),
('John Stones', 'CB', 'Manchester City', 85, 76, 62, 82, 80, 84, 80, 6800, 1000, 1000, 'gold'),
('Jérémy Doku', 'LW', 'Manchester City', 84, 96, 76, 78, 92, 38, 68, 6500, 1000, 1000, 'gold'),

-- MANCHESTER UNITED
('Bruno Fernandes', 'CAM', 'Manchester United', 86, 76, 82, 88, 86, 72, 78, 7800, 1000, 1000, 'premium'),
('Marcus Rashford', 'LW', 'Manchester United', 85, 90, 82, 80, 88, 45, 78, 7200, 1000, 1000, 'gold'),
('Casemiro', 'CDM', 'Manchester United', 85, 68, 72, 78, 74, 86, 86, 7000, 1000, 1000, 'gold'),
('André Onana', 'GK', 'Manchester United', 84, 58, 48, 76, 75, 48, 82, 6200, 1000, 1000, 'gold'),
('Lisandro Martínez', 'CB', 'Manchester United', 84, 72, 58, 78, 76, 86, 80, 6400, 1000, 1000, 'gold'),
('Rasmus Højlund', 'ST', 'Manchester United', 80, 88, 80, 68, 78, 42, 84, 5200, 1000, 1000, 'gold'),
('Diogo Dalot', 'LB', 'Manchester United', 81, 78, 65, 78, 80, 80, 80, 5400, 1000, 1000, 'gold'),
('Kobbie Mainoo', 'CM', 'Manchester United', 79, 76, 72, 80, 84, 76, 78, 4600, 1000, 1000, 'silver'),
('Alejandro Garnacho', 'RW', 'Manchester United', 80, 90, 78, 76, 88, 42, 68, 5000, 1000, 1000, 'gold'),

-- NEWCASTLE
('Bruno Guimarães', 'CM', 'Newcastle', 85, 76, 76, 84, 86, 80, 82, 7200, 1000, 1000, 'gold'),
('Alexander Isak', 'ST', 'Newcastle', 84, 86, 84, 76, 86, 42, 78, 6800, 1000, 1000, 'gold'),
('Anthony Gordon', 'LW', 'Newcastle', 82, 88, 80, 78, 86, 48, 74, 5800, 1000, 1000, 'gold'),
('Kieran Trippier', 'RB', 'Newcastle', 84, 68, 78, 88, 82, 80, 72, 6000, 1000, 1000, 'gold'),
('Sven Botman', 'CB', 'Newcastle', 83, 70, 50, 72, 70, 84, 86, 5600, 1000, 1000, 'gold'),
('Nick Pope', 'GK', 'Newcastle', 84, 52, 48, 70, 65, 45, 82, 5800, 1000, 1000, 'gold'),

-- NOTTINGHAM FOREST
('Morgan Gibbs-White', 'CAM', 'Nottingham Forest', 79, 78, 78, 80, 84, 52, 72, 4200, 1000, 1000, 'silver'),
('Taiwo Awoniyi', 'ST', 'Nottingham Forest', 78, 82, 78, 68, 76, 42, 84, 4000, 1000, 1000, 'silver'),
('Murillo', 'CB', 'Nottingham Forest', 77, 76, 45, 65, 68, 80, 82, 3600, 1000, 1000, 'silver'),

-- SHEFFIELD UNITED
('Gustavo Hamer', 'CM', 'Sheffield United', 76, 74, 74, 78, 80, 70, 76, 3200, 1000, 1000, 'silver'),
('Cameron Archer', 'ST', 'Sheffield United', 75, 84, 76, 68, 76, 40, 74, 3000, 1000, 1000, 'silver'),

-- TOTTENHAM
('Son Heung-min', 'LW', 'Tottenham', 87, 88, 86, 82, 88, 52, 74, 8200, 1000, 1000, 'premium'),
('James Maddison', 'CAM', 'Tottenham', 85, 74, 82, 88, 88, 60, 72, 7200, 1000, 1000, 'gold'),
('Cristian Romero', 'CB', 'Tottenham', 86, 76, 55, 72, 74, 88, 86, 7000, 1000, 1000, 'gold'),
('Dejan Kulusevski', 'RW', 'Tottenham', 84, 82, 80, 84, 88, 55, 80, 6400, 1000, 1000, 'gold'),
('Pedro Porro', 'RB', 'Tottenham', 83, 84, 72, 82, 84, 78, 78, 5800, 1000, 1000, 'gold'),
('Destiny Udogie', 'LB', 'Tottenham', 82, 86, 68, 78, 84, 78, 82, 5600, 1000, 1000, 'gold'),
('Guglielmo Vicario', 'GK', 'Tottenham', 84, 60, 48, 75, 72, 45, 80, 6000, 1000, 1000, 'gold'),
('Richarlison', 'ST', 'Tottenham', 82, 82, 80, 76, 84, 52, 82, 5400, 1000, 1000, 'gold'),
('Brennan Johnson', 'RW', 'Tottenham', 80, 90, 78, 74, 84, 45, 74, 4800, 1000, 1000, 'gold'),
('Micky van de Ven', 'CB', 'Tottenham', 81, 88, 50, 68, 72, 82, 84, 5200, 1000, 1000, 'gold'),

-- WEST HAM
('Jarrod Bowen', 'RW', 'West Ham', 83, 84, 82, 78, 84, 55, 78, 6000, 1000, 1000, 'gold'),
('Declan Rice', 'CDM', 'West Ham', 84, 74, 72, 80, 78, 84, 84, 6400, 1000, 1000, 'gold'),
('Lucas Paquetá', 'CAM', 'West Ham', 82, 76, 78, 82, 86, 58, 80, 5600, 1000, 1000, 'gold'),
('Mohammed Kudus', 'CAM', 'West Ham', 81, 84, 78, 80, 88, 55, 76, 5200, 1000, 1000, 'gold'),
('Alphonse Areola', 'GK', 'West Ham', 81, 58, 45, 70, 68, 42, 80, 4800, 1000, 1000, 'gold'),
('Edson Álvarez', 'CDM', 'West Ham', 81, 72, 62, 72, 74, 82, 86, 5000, 1000, 1000, 'gold'),

-- WOLVERHAMPTON
('Pedro Neto', 'RW', 'Wolverhampton', 82, 90, 78, 80, 88, 48, 72, 5600, 1000, 1000, 'gold'),
('Matheus Cunha', 'ST', 'Wolverhampton', 81, 84, 80, 78, 86, 52, 78, 5400, 1000, 1000, 'gold'),
('Mario Lemina', 'CDM', 'Wolverhampton', 80, 74, 68, 76, 78, 80, 84, 4800, 1000, 1000, 'gold'),
('Max Kilman', 'CB', 'Wolverhampton', 79, 70, 48, 68, 68, 82, 84, 4400, 1000, 1000, 'silver');

-- ============================================
-- UPDATE RARITY BASED ON OVERALL RATING
-- ============================================
UPDATE players SET rarity = 
  CASE 
    WHEN overall_rating >= 90 THEN 'icon'
    WHEN overall_rating >= 86 THEN 'premium'
    WHEN overall_rating >= 82 THEN 'gold'
    WHEN overall_rating >= 77 THEN 'silver'
    ELSE 'bronze'
  END;

-- ============================================
-- SUMMARY
-- ============================================
-- 20 Premier League teams
-- ~120 players with realistic stats
-- All positions covered (GK, DEF, MID, FWD)
-- Price range: 2,800 - 12,000 BALL
